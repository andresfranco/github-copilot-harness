from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    default_snowflake_account: Optional[str] = None
    default_environment: Optional[str] = None
    default_key_size: Optional[int] = None
    default_key_slot: Optional[str] = None
    default_encrypted: Optional[bool] = None


class UserSettings(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    default_snowflake_account: Optional[str] = None
    default_environment: Optional[str] = None
    default_key_size: int
    default_key_slot: Optional[str] = None
    default_encrypted: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    full_name: Optional[str] = None
    default_snowflake_account: Optional[str] = None
    default_environment: Optional[str] = None
    default_key_size: Optional[int] = None
    default_key_slot: Optional[str] = None
    default_encrypted: Optional[bool] = None
