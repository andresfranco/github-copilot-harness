# Handoff: backend-settings-api

## Status: GREEN

All integration tests pass (37/37).

## Files created/modified

- `backend/app/api/settings.py` — Created. `GET /settings` and `PUT /settings` endpoints.
- `backend/app/schemas/user.py` — Updated. Added `UserSettings` and `UserSettingsUpdate` schemas with all user default fields.

## Endpoints implemented

| Method | Path | Response |
|--------|------|----------|
| GET | /settings | 200 UserSettings |
| PUT | /settings | 200 UserSettings (partial update) |

## UserSettings fields

`id`, `email`, `full_name`, `default_snowflake_account`, `default_environment`, `default_key_size`, `default_key_slot`, `default_encrypted`, `created_at`, `updated_at`

## Notes

- `PUT /settings` uses `model_dump(exclude_none=True)` for partial updates — only provided fields are changed.
- `GET /settings` and `PUT /settings` return 401 without valid JWT (enforced by `get_current_user` dependency).
