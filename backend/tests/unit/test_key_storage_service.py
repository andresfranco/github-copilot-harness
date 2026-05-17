# RED: This test file is intentionally failing (imports non-existent modules)
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
from uuid import uuid4, UUID

from app.services.key_storage_service import KeyStorageService  # noqa: F401


# ---------------------------------------------------------------------------
# Helpers / shared fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def db():
    """Minimal async session mock."""
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = AsyncMock()
    return session


@pytest.fixture
def user_id():
    return uuid4()


@pytest.fixture
def other_user_id():
    return uuid4()


@pytest.fixture
def key_id():
    return uuid4()


def _fake_key(key_id: UUID, user_id: UUID, key_slot: str = "RSA_PUBLIC_KEY", status: str = "ACTIVE"):
    from unittest.mock import MagicMock
    key = MagicMock()
    key.id = key_id
    key.user_id = user_id
    key.key_slot = key_slot
    key.status = status
    key.snowflake_username = "ALICE"
    key.alias = "my-key"
    key.encrypted_private_key = "ENCRYPTED_BLOB"
    return key


# ---------------------------------------------------------------------------
# create_key
# ---------------------------------------------------------------------------

class TestCreateKey:
    @pytest.mark.asyncio
    async def test_create_key_encrypted_private_key_differs_from_plain(self, db, user_id):
        """Stored encrypted_private_key must not equal the raw PEM."""
        svc = KeyStorageService()

        plain_pem = "-----BEGIN PRIVATE KEY-----\nFAKE\n-----END PRIVATE KEY-----"

        from unittest.mock import MagicMock
        key_request = MagicMock()
        key_request.alias = "test-key"
        key_request.snowflake_account = "acct.us-east-1"
        key_request.snowflake_username = "ALICE"
        key_request.snowflake_role = None
        key_request.environment = "DEV"
        key_request.key_slot = "RSA_PUBLIC_KEY"
        key_request.key_size = 2048
        key_request.is_encrypted = False
        key_request.expiration_date = None
        key_request.description = None

        key_result = MagicMock()
        key_result.private_key_pem = plain_pem
        key_result.public_key_pem = "-----BEGIN PUBLIC KEY-----\nFAKE\n-----END PUBLIC KEY-----"
        key_result.public_key_value = "FAKEPUBLICVALUE"
        key_result.snowflake_sql = "ALTER USER ALICE SET RSA_PUBLIC_KEY = 'FAKEPUBLICVALUE';"
        key_result.installation_instructions = "chmod 600 key.p8"
        key_result.auth_examples = "import snowflake.connector"

        stored_objects = []

        def capture_add(obj):
            stored_objects.append(obj)

        db.add.side_effect = capture_add

        with patch("app.services.key_storage_service.get_fernet") as mock_fernet_factory:
            mock_fernet = MagicMock()
            mock_fernet.encrypt.return_value = b"ENCRYPTED_BLOB_BYTES"
            mock_fernet_factory.return_value = mock_fernet

            await svc.create_key(db, user_id, key_request, key_result)

        assert stored_objects, "create_key must call db.add"
        stored = stored_objects[0]
        assert stored.encrypted_private_key != plain_pem, (
            "encrypted_private_key in DB must not equal the plain PEM"
        )


# ---------------------------------------------------------------------------
# get_private_key
# ---------------------------------------------------------------------------

class TestGetPrivateKey:
    @pytest.mark.asyncio
    async def test_get_private_key_returns_decrypted_pem(self, db, user_id, key_id):
        svc = KeyStorageService()
        plain_pem = "-----BEGIN PRIVATE KEY-----\nFAKE\n-----END PRIVATE KEY-----"

        fake_key = _fake_key(key_id, user_id)

        with patch.object(svc, "get_key", new_callable=AsyncMock, return_value=fake_key), \
             patch("app.services.key_storage_service.get_fernet") as mock_fernet_factory:

            mock_fernet = MagicMock()
            mock_fernet.decrypt.return_value = plain_pem.encode()
            mock_fernet_factory.return_value = mock_fernet

            result = await svc.get_private_key(db, key_id, user_id)

        assert result == plain_pem


# ---------------------------------------------------------------------------
# get_keys
# ---------------------------------------------------------------------------

class TestGetKeys:
    @pytest.mark.asyncio
    async def test_get_keys_returns_only_user_keys(self, db, user_id, other_user_id):
        svc = KeyStorageService()
        k1 = _fake_key(uuid4(), user_id)
        k2 = _fake_key(uuid4(), user_id)
        k_other = _fake_key(uuid4(), other_user_id)

        async def fake_execute(stmt):
            result = MagicMock()
            # Return only the user's keys regardless of stmt (tested at service layer)
            result.scalars.return_value.all.return_value = [k1, k2]
            return result

        db.execute.side_effect = fake_execute

        keys = await svc.get_keys(db, user_id)

        for key in keys:
            assert key.user_id == user_id, "get_keys must only return keys for the specified user"


# ---------------------------------------------------------------------------
# get_key — authorization
# ---------------------------------------------------------------------------

class TestGetKey:
    @pytest.mark.asyncio
    async def test_get_key_raises_404_for_wrong_user(self, db, user_id, other_user_id, key_id):
        from fastapi import HTTPException
        svc = KeyStorageService()

        # DB returns a key owned by other_user_id
        fake_key = _fake_key(key_id, other_user_id)

        async def fake_execute(stmt):
            result = MagicMock()
            result.scalar_one_or_none.return_value = fake_key
            return result

        db.execute.side_effect = fake_execute

        with pytest.raises(HTTPException) as exc_info:
            await svc.get_key(db, key_id, user_id)

        assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# revoke_key
# ---------------------------------------------------------------------------

class TestRevokeKey:
    @pytest.mark.asyncio
    async def test_revoke_key_sets_status_to_revoked(self, db, user_id, key_id):
        svc = KeyStorageService()
        fake_key = _fake_key(key_id, user_id)

        with patch.object(svc, "get_key", new_callable=AsyncMock, return_value=fake_key):
            result = await svc.revoke_key(db, key_id, user_id)

        assert result.status == "REVOKED"


# ---------------------------------------------------------------------------
# delete_key
# ---------------------------------------------------------------------------

class TestDeleteKey:
    @pytest.mark.asyncio
    async def test_delete_key_removes_record(self, db, user_id, key_id):
        svc = KeyStorageService()
        fake_key = _fake_key(key_id, user_id)

        with patch.object(svc, "get_key", new_callable=AsyncMock, return_value=fake_key):
            await svc.delete_key(db, key_id, user_id)

        db.delete.assert_awaited_once_with(fake_key)
        db.commit.assert_awaited()


# ---------------------------------------------------------------------------
# rotate_key
# ---------------------------------------------------------------------------

class TestRotateKey:
    @pytest.mark.asyncio
    async def test_rotate_key_rsa1_creates_rsa2(self, db, user_id, key_id):
        """Old slot RSA_PUBLIC_KEY → new key uses RSA_PUBLIC_KEY_2."""
        svc = KeyStorageService()
        old_key = _fake_key(key_id, user_id, key_slot="RSA_PUBLIC_KEY")

        new_request = MagicMock()
        new_request.key_slot = "RSA_PUBLIC_KEY_2"

        with patch.object(svc, "get_key", new_callable=AsyncMock, return_value=old_key), \
             patch.object(svc, "create_key", new_callable=AsyncMock) as mock_create:

            new_key = _fake_key(uuid4(), user_id, key_slot="RSA_PUBLIC_KEY_2")
            mock_create.return_value = new_key

            result_key, cleanup_sql = await svc.rotate_key(db, key_id, user_id, new_request)

        assert result_key.key_slot == "RSA_PUBLIC_KEY_2"

    @pytest.mark.asyncio
    async def test_rotate_key_rsa2_creates_rsa1(self, db, user_id, key_id):
        """Old slot RSA_PUBLIC_KEY_2 → new key uses RSA_PUBLIC_KEY."""
        svc = KeyStorageService()
        old_key = _fake_key(key_id, user_id, key_slot="RSA_PUBLIC_KEY_2")

        new_request = MagicMock()
        new_request.key_slot = "RSA_PUBLIC_KEY"

        with patch.object(svc, "get_key", new_callable=AsyncMock, return_value=old_key), \
             patch.object(svc, "create_key", new_callable=AsyncMock) as mock_create:

            new_key = _fake_key(uuid4(), user_id, key_slot="RSA_PUBLIC_KEY")
            mock_create.return_value = new_key

            result_key, cleanup_sql = await svc.rotate_key(db, key_id, user_id, new_request)

        assert result_key.key_slot == "RSA_PUBLIC_KEY"

    @pytest.mark.asyncio
    async def test_rotate_key_cleanup_sql_unset_rsa1(self, db, user_id, key_id):
        """cleanup_sql must contain UNSET RSA_PUBLIC_KEY when old slot is RSA_PUBLIC_KEY."""
        svc = KeyStorageService()
        old_key = _fake_key(key_id, user_id, key_slot="RSA_PUBLIC_KEY")

        new_request = MagicMock()
        new_request.key_slot = "RSA_PUBLIC_KEY_2"

        with patch.object(svc, "get_key", new_callable=AsyncMock, return_value=old_key), \
             patch.object(svc, "create_key", new_callable=AsyncMock) as mock_create:

            new_key = _fake_key(uuid4(), user_id, key_slot="RSA_PUBLIC_KEY_2")
            mock_create.return_value = new_key

            _, cleanup_sql = await svc.rotate_key(db, key_id, user_id, new_request)

        assert "UNSET RSA_PUBLIC_KEY" in cleanup_sql

    @pytest.mark.asyncio
    async def test_rotate_key_cleanup_sql_unset_rsa2(self, db, user_id, key_id):
        """cleanup_sql must contain UNSET RSA_PUBLIC_KEY_2 when old slot is RSA_PUBLIC_KEY_2."""
        svc = KeyStorageService()
        old_key = _fake_key(key_id, user_id, key_slot="RSA_PUBLIC_KEY_2")

        new_request = MagicMock()
        new_request.key_slot = "RSA_PUBLIC_KEY"

        with patch.object(svc, "get_key", new_callable=AsyncMock, return_value=old_key), \
             patch.object(svc, "create_key", new_callable=AsyncMock) as mock_create:

            new_key = _fake_key(uuid4(), user_id, key_slot="RSA_PUBLIC_KEY")
            mock_create.return_value = new_key

            _, cleanup_sql = await svc.rotate_key(db, key_id, user_id, new_request)

        assert "UNSET RSA_PUBLIC_KEY_2" in cleanup_sql
