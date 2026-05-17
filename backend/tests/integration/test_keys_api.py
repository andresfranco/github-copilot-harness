# RED: This test file is intentionally failing (imports non-existent modules)
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app  # noqa: F401


pytestmark = pytest.mark.asyncio

_USER_A = {"email": "keysuser_a@example.com", "password": "SecurePass123!", "full_name": "Alice"}
_USER_B = {"email": "keysuser_b@example.com", "password": "BobSecure456@", "full_name": "Bob"}

_VALID_KEY_PAYLOAD = {
    "alias": "my-test-key",
    "snowflake_account": "myaccount.us-east-1",
    "snowflake_username": "ALICE",
    "snowflake_role": None,
    "environment": "DEV",
    "key_slot": "RSA_PUBLIC_KEY",
    "key_size": 2048,
    "is_encrypted": False,
    "passphrase": None,
    "expiration_date": None,
    "description": None,
}


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


async def _register_and_login(client: AsyncClient, user: dict) -> str:
    await client.post("/auth/register", json=user)
    resp = await client.post("/auth/login", data={"username": user["email"], "password": user["password"]})
    return resp.json()["access_token"]


@pytest.fixture
async def token_a(client):
    return await _register_and_login(client, _USER_A)


@pytest.fixture
async def token_b(client):
    return await _register_and_login(client, _USER_B)


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class TestCreateKey:
    async def test_post_keys_returns_201_with_valid_data(self, client, token_a):
        resp = await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token_a))
        assert resp.status_code == 201

    async def test_post_keys_returns_409_for_duplicate_alias(self, client, token_a):
        await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token_a))
        resp = await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token_a))
        assert resp.status_code == 409

    async def test_post_keys_returns_422_for_missing_alias(self, client, token_a):
        payload = {k: v for k, v in _VALID_KEY_PAYLOAD.items() if k != "alias"}
        resp = await client.post("/keys", json=payload, headers=_auth(token_a))
        assert resp.status_code == 422

    async def test_post_keys_returns_422_for_invalid_key_size(self, client, token_a):
        payload = {**_VALID_KEY_PAYLOAD, "key_size": 1024}
        resp = await client.post("/keys", json=payload, headers=_auth(token_a))
        assert resp.status_code == 422


class TestListKeys:
    async def test_get_keys_returns_200(self, client, token_a):
        resp = await client.get("/keys", headers=_auth(token_a))
        assert resp.status_code == 200

    async def test_get_keys_response_has_no_private_key_fields(self, client, token_a):
        await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token_a))
        resp = await client.get("/keys", headers=_auth(token_a))
        for item in resp.json():
            assert "private_key_pem" not in item, "Key list must not expose private_key_pem"
            assert "encrypted_private_key" not in item, "Key list must not expose encrypted_private_key"

    async def test_get_keys_returns_only_authenticated_user_keys(self, client, token_a, token_b):
        await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token_a))
        resp = await client.get("/keys", headers=_auth(token_b))
        # User B should see 0 keys (they have not created any)
        assert resp.json() == []


class TestGetKeyDetail:
    async def _create_key(self, client, token) -> str:
        resp = await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token))
        return resp.json()["id"]

    async def test_get_key_detail_returns_200(self, client, token_a):
        key_id = await self._create_key(client, token_a)
        resp = await client.get(f"/keys/{key_id}", headers=_auth(token_a))
        assert resp.status_code == 200

    async def test_get_key_detail_no_private_key_pem(self, client, token_a):
        key_id = await self._create_key(client, token_a)
        resp = await client.get(f"/keys/{key_id}", headers=_auth(token_a))
        assert "private_key_pem" not in resp.json()

    async def test_get_key_detail_returns_404_for_other_user(self, client, token_a, token_b):
        key_id = await self._create_key(client, token_a)
        resp = await client.get(f"/keys/{key_id}", headers=_auth(token_b))
        assert resp.status_code == 404


class TestGetPrivateKey:
    async def _create_key(self, client, token) -> str:
        resp = await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token))
        return resp.json()["id"]

    async def test_get_private_key_returns_200_with_pem(self, client, token_a):
        key_id = await self._create_key(client, token_a)
        resp = await client.get(f"/keys/{key_id}/private", headers=_auth(token_a))
        assert resp.status_code == 200
        assert "private_key_pem" in resp.json()


class TestRevokeKey:
    async def _create_key(self, client, token) -> str:
        resp = await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token))
        return resp.json()["id"]

    async def test_revoke_key_returns_200_with_revoked_status(self, client, token_a):
        key_id = await self._create_key(client, token_a)
        resp = await client.post(f"/keys/{key_id}/revoke", headers=_auth(token_a))
        assert resp.status_code == 200
        assert resp.json()["status"] == "REVOKED"


class TestDeleteKey:
    async def _create_key(self, client, token) -> str:
        resp = await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token))
        return resp.json()["id"]

    async def test_delete_key_returns_204(self, client, token_a):
        key_id = await self._create_key(client, token_a)
        resp = await client.delete(f"/keys/{key_id}", headers=_auth(token_a))
        assert resp.status_code == 204


class TestRotateKey:
    async def _create_key(self, client, token) -> str:
        resp = await client.post("/keys", json=_VALID_KEY_PAYLOAD, headers=_auth(token))
        return resp.json()["id"]

    async def test_rotate_key_returns_201_with_new_key_and_cleanup_sql(self, client, token_a):
        key_id = await self._create_key(client, token_a)
        rotate_payload = {
            **_VALID_KEY_PAYLOAD,
            "alias": "rotated-key",
            "key_slot": "RSA_PUBLIC_KEY_2",
        }
        resp = await client.post(f"/keys/{key_id}/rotate", json=rotate_payload, headers=_auth(token_a))
        assert resp.status_code == 201
        body = resp.json()
        assert "new_key" in body
        assert "cleanup_sql" in body
