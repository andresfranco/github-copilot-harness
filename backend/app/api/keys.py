from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.snowflake_key import SnowflakeKey
from app.models.user import User
from app.schemas.key import (
    AuditLogResponse,
    KeyGenerationRequest,
    KeyResponse,
    KeySummaryResponse,
    KeyUpdateRequest,
)
from app.services.audit_service import AuditService
from app.services.key_generation_service import KeyGenerationService
from app.services.key_storage_service import KeyStorageService

router = APIRouter(prefix="/keys", tags=["keys"])

_storage = KeyStorageService()
_audit = AuditService()
_generator = KeyGenerationService()


@router.post(
    "",
    response_model=KeyResponse,
    response_model_exclude_none=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_key(
    request_body: KeyGenerationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> KeyResponse:
    existing = await db.execute(
        select(SnowflakeKey).where(
            SnowflakeKey.user_id == current_user.id,
            SnowflakeKey.alias == request_body.alias,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A key with this alias already exists",
        )

    try:
        result = _generator.generate_key_pair(request_body)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    key = await _storage.create_key(db, current_user.id, request_body, result=result)
    return KeyResponse.model_validate(key).model_copy(
        update={"private_key_pem": result.private_key_pem}
    )


@router.get("", response_model=list[KeySummaryResponse])
async def list_keys(
    environment: str | None = Query(default=None),
    status: str | None = Query(default=None),
    snowflake_username: str | None = Query(default=None),
    key_slot: str | None = Query(default=None),
    search: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[KeySummaryResponse]:
    keys = await _storage.get_keys(
        db,
        user_id=current_user.id,
        environment=environment,
        status=status,
        snowflake_username=snowflake_username,
        key_slot=key_slot,
        search=search,
    )
    return [KeySummaryResponse.model_validate(k) for k in keys]


@router.get(
    "/{key_id}",
    response_model=KeyResponse,
    response_model_exclude_none=True,
)
async def get_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> KeyResponse:
    key = await _storage.get_key(db, key_id, current_user.id)
    return KeyResponse.model_validate(key)


@router.get("/{key_id}/private")
async def get_private_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    private_key_pem = await _storage.get_private_key(db, key_id, current_user.id)
    return {"private_key_pem": private_key_pem}


@router.put(
    "/{key_id}",
    response_model=KeyResponse,
    response_model_exclude_none=True,
)
async def update_key(
    key_id: UUID,
    request_body: KeyUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> KeyResponse:
    key = await _storage.update_key(db, key_id, current_user.id, request_body)
    return KeyResponse.model_validate(key)


@router.delete("/{key_id}")
async def delete_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    await _storage.delete_key(db, key_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{key_id}/revoke",
    response_model=KeyResponse,
    response_model_exclude_none=True,
)
async def revoke_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> KeyResponse:
    key = await _storage.revoke_key(db, key_id, current_user.id)
    return KeyResponse.model_validate(key)


@router.post("/{key_id}/rotate", status_code=status.HTTP_201_CREATED)
async def rotate_key(
    key_id: UUID,
    request_body: KeyGenerationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    new_key, cleanup_sql = await _storage.rotate_key(
        db, key_id, current_user.id, request_body
    )
    new_key_response = KeyResponse.model_validate(new_key)
    return {
        "new_key": new_key_response.model_dump(exclude_none=True),
        "cleanup_sql": cleanup_sql,
    }


@router.get("/{key_id}/audit", response_model=list[AuditLogResponse])
async def get_audit_history(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AuditLogResponse]:
    logs = await _audit.get_audit_history(db, key_id, current_user.id)
    return [AuditLogResponse.model_validate(log) for log in logs]
