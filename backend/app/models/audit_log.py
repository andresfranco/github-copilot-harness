from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.snowflake_key import SnowflakeKey


class AuditAction(str, enum.Enum):
    KEY_CREATED = "KEY_CREATED"
    PRIVATE_KEY_VIEWED = "PRIVATE_KEY_VIEWED"
    PRIVATE_KEY_COPIED = "PRIVATE_KEY_COPIED"
    PRIVATE_KEY_DOWNLOADED = "PRIVATE_KEY_DOWNLOADED"
    PUBLIC_KEY_COPIED = "PUBLIC_KEY_COPIED"
    PUBLIC_KEY_DOWNLOADED = "PUBLIC_KEY_DOWNLOADED"
    SQL_COPIED = "SQL_COPIED"
    SQL_DOWNLOADED = "SQL_DOWNLOADED"
    INSTRUCTIONS_COPIED = "INSTRUCTIONS_COPIED"
    INSTRUCTIONS_DOWNLOADED = "INSTRUCTIONS_DOWNLOADED"
    METADATA_UPDATED = "METADATA_UPDATED"
    KEY_ROTATED = "KEY_ROTATED"
    KEY_REVOKED = "KEY_REVOKED"
    KEY_DELETED = "KEY_DELETED"


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_key_id", "key_id"),
        Index("ix_audit_logs_user_id", "user_id"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    key_id: Mapped[UUID] = mapped_column(ForeignKey("snowflake_keys.id"), nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    key: Mapped[SnowflakeKey] = relationship("SnowflakeKey", back_populates="audit_logs")
