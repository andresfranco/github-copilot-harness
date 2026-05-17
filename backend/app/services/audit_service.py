from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditService:
    async def log(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
        action: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        entry = AuditLog(
            key_id=key_id,
            user_id=user_id,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(entry)
        await db.commit()

    async def _assert_key_ownership(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
    ) -> None:
        from app.models.snowflake_key import SnowflakeKey

        result = await db.execute(
            select(SnowflakeKey).where(
                SnowflakeKey.id == key_id,
                SnowflakeKey.user_id == user_id,
            )
        )
        key = result.scalar_one_or_none()
        if key is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Key not found",
            )

    async def get_audit_history(
        self,
        db: AsyncSession,
        key_id: UUID,
        user_id: UUID,
    ) -> list[AuditLog]:
        await self._assert_key_ownership(db, key_id, user_id)
        result = await db.execute(
            select(AuditLog)
            .where(AuditLog.key_id == key_id)
            .order_by(AuditLog.created_at.desc())
        )
        return list(result.scalars().all())
