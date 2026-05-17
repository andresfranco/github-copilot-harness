from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


class KeyGenerationRequest(BaseModel):
    alias: str
    snowflake_account: str
    snowflake_username: str
    snowflake_role: Optional[str] = None
    environment: str
    key_slot: str
    key_size: int
    is_encrypted: bool = False
    passphrase: Optional[str] = None
    confirm_passphrase: Optional[str] = None
    expiration_date: Optional[date] = None
    description: Optional[str] = None

    @field_validator("key_size")
    @classmethod
    def validate_key_size(cls, v: int) -> int:
        if v not in (2048, 4096):
            raise ValueError("key_size must be 2048 or 4096")
        return v


class KeyGenerationResult(BaseModel):
    private_key_pem: str
    public_key_pem: str
    public_key_value: str
    snowflake_sql: str
    installation_instructions: str
    auth_examples: str


class KeyUpdateRequest(BaseModel):
    alias: Optional[str] = None
    description: Optional[str] = None
    expiration_date: Optional[date] = None
    snowflake_role: Optional[str] = None


class KeyResponse(BaseModel):
    id: UUID
    alias: str
    snowflake_account: str
    snowflake_username: str
    snowflake_role: Optional[str]
    environment: str
    key_slot: str
    key_size: int
    is_encrypted: bool
    status: str
    public_key_pem: str
    public_key_value: str
    snowflake_sql: str
    installation_instructions: str
    auth_examples: str
    expiration_date: Optional[date]
    description: Optional[str]
    private_key_pem: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_viewed_at: Optional[datetime] = None
    last_downloaded_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class KeySummaryResponse(BaseModel):
    """Used in list endpoint — no private key data."""

    id: UUID
    alias: str
    snowflake_account: str
    snowflake_username: str
    snowflake_role: Optional[str]
    environment: str
    key_slot: str
    key_size: int
    is_encrypted: bool
    status: str
    expiration_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id: UUID
    key_id: UUID
    user_id: UUID
    action: str
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_keys: int
    active_keys: int
    rotating_keys: int
    expired_keys: int
    revoked_keys: int
    expiring_soon: int
    recent_activity: List[AuditLogResponse]
    recently_created: List[KeySummaryResponse]
