from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserSettings, UserSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=UserSettings)
async def get_settings(
    current_user: User = Depends(get_current_user),
) -> UserSettings:
    return UserSettings.model_validate(current_user)


@router.put("", response_model=UserSettings)
async def update_settings(
    request_body: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserSettings:
    update_data = request_body.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return UserSettings.model_validate(current_user)
