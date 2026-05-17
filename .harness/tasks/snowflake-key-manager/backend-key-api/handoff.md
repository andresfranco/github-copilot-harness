# Handoff: backend-key-api

## Status: GREEN

All integration tests pass (37/37).

## Files created/modified

- `backend/app/api/keys.py` — Created. FastAPI router with all 9 endpoints.
- `backend/app/api/dashboard.py` — Created. Dashboard stats endpoint scoped to current user.
- `backend/app/schemas/key.py` — Updated. Added `field_validator` for `key_size`, changed datetime/UUID field types for Pydantic v2 compatibility, added `private_key_pem: Optional[str] = None` to `KeyResponse`, added `AuditLogResponse` and `DashboardStats` schemas.
- `backend/app/main.py` — Updated. Replaced placeholder router stubs with imports from the new API modules.
- `backend/.env` — Created. Provides a stable `ENCRYPTION_KEY` for test/dev (required because `get_fernet()` generates a new random key per call when `ENCRYPTION_KEY` is unset, causing encrypt/decrypt mismatch).

## Endpoints implemented

| Method | Path | Status |
|--------|------|--------|
| POST | /keys | 201 with `private_key_pem` |
| GET | /keys | 200 list (no private key data) |
| GET | /keys/{id} | 200 detail (no private key) |
| GET | /keys/{id}/private | 200 `{"private_key_pem": "..."}` + audit log |
| PUT | /keys/{id} | 200 updated detail |
| DELETE | /keys/{id} | 204 no content |
| POST | /keys/{id}/revoke | 200 with status=REVOKED |
| POST | /keys/{id}/rotate | 201 `{"new_key": ..., "cleanup_sql": "..."}` |
| GET | /keys/{id}/audit | 200 audit log list |
| GET | /dashboard | 200 DashboardStats |

## Notes

- 409 alias uniqueness checked before key generation to avoid wasted CPU.
- `response_model_exclude_none=True` used on detail/list endpoints so `private_key_pem: null` is never leaked.
- FastAPI 0.111.0 disallows `-> None` on 204 routes; DELETE returns `Response(status_code=204)` directly.
- Dashboard `expiring_soon` counts keys where `expiration_date <= today + 30 days` AND `status != REVOKED`.
