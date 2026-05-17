# RED: This test file is intentionally failing (imports non-existent modules)
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.services.audit_service import AuditService  # noqa: F401


@pytest.fixture
def db():
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
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


class TestAuditServiceLog:
    @pytest.mark.asyncio
    async def test_log_creates_audit_record_with_correct_action(self, db, user_id, key_id):
        svc = AuditService()
        captured = []

        def capture_add(obj):
            captured.append(obj)

        db.add.side_effect = capture_add

        await svc.log(db, key_id=key_id, user_id=user_id, action="KEY_CREATED")

        assert captured, "log() must call db.add with an AuditLog record"
        record = captured[0]
        assert record.action == "KEY_CREATED"
        assert record.key_id == key_id
        assert record.user_id == user_id

    @pytest.mark.asyncio
    async def test_log_commits_session(self, db, user_id, key_id):
        svc = AuditService()
        await svc.log(db, key_id=key_id, user_id=user_id, action="PRIVATE_KEY_VIEWED")
        db.commit.assert_awaited()

    @pytest.mark.asyncio
    async def test_log_stores_ip_address_when_provided(self, db, user_id, key_id):
        svc = AuditService()
        captured = []
        db.add.side_effect = captured.append

        await svc.log(db, key_id=key_id, user_id=user_id, action="KEY_DELETED", ip_address="10.0.0.1")

        assert captured[0].ip_address == "10.0.0.1"


class TestAuditServiceGetAuditHistory:
    @pytest.mark.asyncio
    async def test_get_audit_history_returns_entries_for_key(self, db, user_id, key_id):
        svc = AuditService()

        entry1 = MagicMock()
        entry1.key_id = key_id
        entry1.user_id = user_id

        async def fake_execute(stmt):
            result = MagicMock()
            result.scalars.return_value.all.return_value = [entry1]
            return result

        db.execute.side_effect = fake_execute

        # Patch ownership check to pass
        with patch.object(svc, "_assert_key_ownership", new_callable=AsyncMock):
            entries = await svc.get_audit_history(db, key_id=key_id, user_id=user_id)

        assert len(entries) == 1
        assert entries[0].key_id == key_id

    @pytest.mark.asyncio
    async def test_get_audit_history_raises_404_for_wrong_user(self, db, user_id, other_user_id, key_id):
        from fastapi import HTTPException
        svc = AuditService()

        # Ownership check should raise 404 for wrong user
        with patch.object(
            svc,
            "_assert_key_ownership",
            new_callable=AsyncMock,
            side_effect=HTTPException(status_code=404, detail="Not found"),
        ):
            with pytest.raises(HTTPException) as exc_info:
                await svc.get_audit_history(db, key_id=key_id, user_id=other_user_id)

        assert exc_info.value.status_code == 404
