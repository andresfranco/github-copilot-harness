import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import app.models.audit_log  # noqa: F401 - register models with Base.metadata
import app.models.snowflake_key  # noqa: F401
import app.models.user  # noqa: F401
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core import database
from app.api.auth import router as auth_router
from app.api.keys import router as keys_router
from app.api.dashboard import router as dashboard_router
from app.api.settings import router as settings_router

# Configure async engine for SQLite with StaticPool so a single in-memory
# connection is shared across all checkouts (required for :memory: databases).
_db_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
if "sqlite" in _db_url:
    database.engine = create_async_engine(
        _db_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    database.AsyncSessionLocal = async_sessionmaker(
        database.engine, expire_on_commit=False
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with database.engine.begin() as conn:
        await conn.run_sync(database.Base.metadata.create_all)
    yield


application = FastAPI(title="Snowflake Key Manager", lifespan=lifespan)

application.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

application.include_router(auth_router)
application.include_router(keys_router)
application.include_router(dashboard_router)
application.include_router(settings_router)

app = application
