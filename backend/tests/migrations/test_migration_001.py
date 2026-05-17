# RED: This test file is intentionally failing (imports non-existent modules)
"""
Migration smoke tests.

These tests verify that after Alembic migration 001 is applied, the expected
tables exist in the database.  They require a real (or in-memory) database
connection and will fail until the migration and alembic infrastructure are in place.
"""
import pytest
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from alembic.config import Config  # noqa: F401 — not yet installed
from alembic import command  # noqa: F401 — not yet installed


EXPECTED_TABLES = ["users", "snowflake_keys", "audit_logs"]


@pytest.fixture(scope="module")
async def migrated_engine():
    """
    Create an isolated async SQLite engine, run Alembic migrations up to head,
    and yield the engine.  Tears down afterwards.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)

    # Run migrations programmatically
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", "sqlite+aiosqlite:///:memory:")

    def run_upgrade(connection, cfg):
        cfg.attributes["connection"] = connection
        command.upgrade(cfg, "head")

    async with engine.begin() as conn:
        await conn.run_sync(run_upgrade, alembic_cfg)

    yield engine
    await engine.dispose()


class TestMigration001Tables:
    @pytest.mark.asyncio
    async def test_users_table_exists(self, migrated_engine):
        async with migrated_engine.connect() as conn:
            tables = await conn.run_sync(lambda c: inspect(c).get_table_names())
        assert "users" in tables, "Migration 001 must create the 'users' table"

    @pytest.mark.asyncio
    async def test_snowflake_keys_table_exists(self, migrated_engine):
        async with migrated_engine.connect() as conn:
            tables = await conn.run_sync(lambda c: inspect(c).get_table_names())
        assert "snowflake_keys" in tables, "Migration 001 must create the 'snowflake_keys' table"

    @pytest.mark.asyncio
    async def test_audit_logs_table_exists(self, migrated_engine):
        async with migrated_engine.connect() as conn:
            tables = await conn.run_sync(lambda c: inspect(c).get_table_names())
        assert "audit_logs" in tables, "Migration 001 must create the 'audit_logs' table"

    @pytest.mark.asyncio
    async def test_users_has_hashed_password_column(self, migrated_engine):
        async with migrated_engine.connect() as conn:
            columns = await conn.run_sync(
                lambda c: [col["name"] for col in inspect(c).get_columns("users")]
            )
        assert "hashed_password" in columns
        assert "password" not in columns

    @pytest.mark.asyncio
    async def test_snowflake_keys_has_encrypted_private_key_column(self, migrated_engine):
        async with migrated_engine.connect() as conn:
            columns = await conn.run_sync(
                lambda c: [col["name"] for col in inspect(c).get_columns("snowflake_keys")]
            )
        assert "encrypted_private_key" in columns
        assert "private_key_pem" not in columns
