from __future__ import annotations

from uuid import UUID

from cryptography.fernet import Fernet
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.snowflake_key import SnowflakeKey
from app.schemas.key import KeyUpdateRequest
from app.services.audit_service import AuditService


def get_fernet() -> Fernet:
    from app.core.config import settings

    key = settings.ENCRYPTION_KEY
    if not key:
        key = Fernet.generate_key().decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


class KeyStorageService:
    def __init__(self) -> None:
        self._audit = AuditService()

    async def create_key(
        self,
        db: AsyncSession,
        user_id: UUID,
        request,
        result=None,
    ) -> SnowflakeKey:
        if result is None:
            from app.services.key_generation_service import KeyGenerationService

            result = KeyGenerationService().generate_key_pair(request)

        fernet = get_fernet()
        encrypted = fernet.encrypt(result.private_key_pem.encode()).decode()

        key = SnowflakeKey(
            user_id=user_id,
            alias=request.alias,
            snowflake_account=request.snowflake_account,
            snowflake_username=request.snowflake_username,
            snowflake_role=request.snowflake_role,
            environment=request.environment,
            key_slot=request.key_slot,
            key_size=request.key_size,
            is_encrypted=request.is_encrypted,
            status="ACTIVE",
            encrypted_private_key=encrypted,
            public_key_pem=result.public_key_pem,
            public_key_value=result.public_key_value,
            snowflake_sql=result.snowflake_sql,
            installation_instructions=result.installation_instructions,
            auth_examples=result.auth_examples,
            expiration_date=request.expiration_date,
            description=request.description,
        )
        db.add(key)
        await db.commit()
        await db.refresh(key)
        await self._audit.log(db, key_id=key.id, user_id=user_id, action="KEY_CREATED")
        return key

    async def get_keys(
        self,
        db: AsyncSession,
        user_id: UUID,
        environment: str | None = None,
        status: str | None = None,
        snowflake_username: str | None = None,
        key_slot: str | None = None,
        search: str | None = None,
    ) -> list[SnowflakeKey]:
        stmt = select(SnowflakeKey).where(SnowflakeKey.user_id == user_id)
        if environment is not None:
            stmt = stmt.where(SnowflakeKey.environment == environment)
        if status is not None:
            stmt = stmt.where(SnowflakeKey.status == status)
        if snowflake_username is not None:
            stmt = stmt.where(SnowflakeKey.snowflake_username == snowflake_username)
        if key_slot is not None:
            stmt = stmt.where(SnowflakeKey.key_slot == key_slot)
        if search is not None:
            stmt = stmt.where(SnowflakeKey.alias.ilike(f"%{search}%"))
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_key(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
    ) -> SnowflakeKey:
        result = await db.execute(
            select(SnowflakeKey).where(SnowflakeKey.id == key_id)
        )
        key = result.scalar_one_or_none()
        if key is None or key.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key not found",
            )
        return key

    async def get_private_key(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
    ) -> str:
        key = await self.get_key(db, key_id, user_id)
        fernet = get_fernet()
        plain_pem = fernet.decrypt(key.encrypted_private_key.encode()).decode()
        await self._audit.log(
            db, key_id=key_id, user_id=user_id, action="PRIVATE_KEY_VIEWED"
        )
        return plain_pem

    async def update_key(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
        data: KeyUpdateRequest,
    ) -> SnowflakeKey:
        key = await self.get_key(db, key_id, user_id)
        update_fields = data.model_dump(exclude_none=True)
        for field, value in update_fields.items():
            setattr(key, field, value)
        await db.commit()
        await db.refresh(key)
        await self._audit.log(
            db, key_id=key_id, user_id=user_id, action="METADATA_UPDATED"
        )
        return key

    async def revoke_key(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
    ) -> SnowflakeKey:
        key = await self.get_key(db, key_id, user_id)
        key.status = "REVOKED"
        await db.commit()
        await db.refresh(key)
        await self._audit.log(
            db, key_id=key_id, user_id=user_id, action="KEY_REVOKED"
        )
        return key

    async def delete_key(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
    ) -> None:
        key = await self.get_key(db, key_id, user_id)
        await self._audit.log(
            db, key_id=key_id, user_id=user_id, action="KEY_DELETED"
        )
        await db.delete(key)
        await db.commit()

    async def rotate_key(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
        new_request,
    ) -> tuple[SnowflakeKey, str]:
        old_key = await self.get_key(db, key_id, user_id)
        old_slot = old_key.key_slot
        new_slot = (
            "RSA_PUBLIC_KEY_2"
            if old_slot == "RSA_PUBLIC_KEY"
            else "RSA_PUBLIC_KEY"
        )
        new_request.key_slot = new_slot
        new_key = await self.create_key(db, user_id, new_request)
        old_key.status = "ROTATING"
        await db.commit()
        cleanup_sql = f"ALTER USER {old_key.snowflake_username}\nUNSET {old_slot};"
        await self._audit.log(
            db, key_id=old_key.id, user_id=user_id, action="KEY_ROTATED"
        )
        return new_key, cleanup_sql
