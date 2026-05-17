from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.snowflake_key import SnowflakeKey


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    default_snowflake_account: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    default_environment: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    default_key_size: Mapped[int] = mapped_column(Integer, default=2048)
    default_key_slot: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    default_encrypted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    snowflake_keys: Mapped[list[SnowflakeKey]] = relationship(
        "SnowflakeKey", back_populates="user", cascade="all, delete-orphan"
    )
