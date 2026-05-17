"""
Per-test database isolation for integration tests.

Each test gets a fresh in-memory SQLite database via the `fresh_db` autouse
fixture. This replaces the shared engine in `app.core.database` before every
test and disposes it afterwards, so tests never share state.
"""
import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.models.audit_log  # noqa: F401
import app.models.snowflake_key  # noqa: F401
import app.models.user  # noqa: F401
from app.core import database


@pytest.fixture(autouse=True)
async def fresh_db():
    new_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    database.engine = new_engine
    database.AsyncSessionLocal = async_sessionmaker(
        new_engine, expire_on_commit=False
    )

    async with new_engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.create_all)

    yield

    async with new_engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.drop_all)
    await new_engine.dispose()
