from __future__ import annotations

import enum
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.audit_log import AuditLog
    from app.models.user import User


class Environment(str, enum.Enum):
    DEV = "DEV"
    TEST = "TEST"
    QA = "QA"
    PROD = "PROD"
    SANDBOX = "SANDBOX"
    OTHER = "OTHER"


class KeySlot(str, enum.Enum):
    RSA_PUBLIC_KEY = "RSA_PUBLIC_KEY"
    RSA_PUBLIC_KEY_2 = "RSA_PUBLIC_KEY_2"


class KeyStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ROTATING = "ROTATING"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"


class SnowflakeKey(Base):
    __tablename__ = "snowflake_keys"
    __table_args__ = (
        UniqueConstraint("user_id", "alias", name="uq_snowflake_key_user_alias"),
        Index("ix_snowflake_keys_user_id", "user_id"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    alias: Mapped[str] = mapped_column(String(255), nullable=False)
    snowflake_account: Mapped[str] = mapped_column(String(255), nullable=False)
    snowflake_username: Mapped[str] = mapped_column(String(255), nullable=False)
    snowflake_role: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    environment: Mapped[str] = mapped_column(String(20), nullable=False)
    key_slot: Mapped[str] = mapped_column(String(30), nullable=False)
    key_size: Mapped[int] = mapped_column(Integer, nullable=False)
    is_encrypted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=KeyStatus.ACTIVE.value
    )
    encrypted_private_key: Mapped[str] = mapped_column(Text, nullable=False)
    public_key_pem: Mapped[str] = mapped_column(Text, nullable=False)
    public_key_value: Mapped[str] = mapped_column(Text, nullable=False)
    snowflake_sql: Mapped[str] = mapped_column(Text, nullable=False)
    installation_instructions: Mapped[str] = mapped_column(Text, nullable=False)
    auth_examples: Mapped[str] = mapped_column(Text, nullable=False)
    expiration_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    last_viewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_downloaded_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped[User] = relationship("User", back_populates="snowflake_keys")
    audit_logs: Mapped[list[AuditLog]] = relationship(
        "AuditLog", back_populates="key", cascade="all, delete-orphan"
    )
