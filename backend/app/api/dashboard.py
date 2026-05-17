from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.audit_log import AuditLog
from app.models.snowflake_key import SnowflakeKey
from app.models.user import User
from app.schemas.key import AuditLogResponse, DashboardStats, KeySummaryResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardStats:
    keys_result = await db.execute(
        select(SnowflakeKey).where(SnowflakeKey.user_id == current_user.id)
    )
    keys = list(keys_result.scalars().all())

    soon = date.today() + timedelta(days=30)

    total = len(keys)
    active = sum(1 for k in keys if k.status == "ACTIVE")
    rotating = sum(1 for k in keys if k.status == "ROTATING")
    expired = sum(1 for k in keys if k.status == "EXPIRED")
    revoked = sum(1 for k in keys if k.status == "REVOKED")
    expiring_soon = sum(
        1
        for k in keys
        if k.expiration_date is not None
        and k.status != "REVOKED"
        and k.expiration_date <= soon
    )

    key_ids = [k.id for k in keys]
    recent_activity: list[AuditLog] = []
    if key_ids:
        activity_result = await db.execute(
            select(AuditLog)
            .where(AuditLog.key_id.in_(key_ids))
            .order_by(AuditLog.created_at.desc())
            .limit(10)
        )
        recent_activity = list(activity_result.scalars().all())

    recently_created = sorted(keys, key=lambda k: k.created_at, reverse=True)[:5]

    return DashboardStats(
        total_keys=total,
        active_keys=active,
        rotating_keys=rotating,
        expired_keys=expired,
        revoked_keys=revoked,
        expiring_soon=expiring_soon,
        recent_activity=[AuditLogResponse.model_validate(a) for a in recent_activity],
        recently_created=[KeySummaryResponse.model_validate(k) for k in recently_created],
    )
