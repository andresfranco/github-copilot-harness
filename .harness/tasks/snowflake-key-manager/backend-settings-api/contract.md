# Contract: backend-settings-api

## Task

Implement the user settings/profile update endpoint.

## Worker

harness-worker-backend

## Depends on

- backend-auth

## Touches

- backend/app/api/settings.py

## Endpoints

### GET /settings

Auth: required.
Response 200: user settings object.

### PUT /settings

Auth: required.
Request:
```json
{
  "full_name": "Alice",
  "default_snowflake_account": "my_account.us-east-1",
  "default_environment": "DEV",
  "default_key_size": 2048,
  "default_key_slot": "RSA_PUBLIC_KEY",
  "default_encrypted": false
}
```
All fields optional (partial update).
Response 200: updated user settings object.

## Correctness assertions covered

- 45: User can update profile fields and defaults.
- 46: Updated defaults are returned for use as form pre-fill.

## Test files

- backend/tests/integration/test_settings_api.py

## Definition of done

- Endpoints implemented.
- Integration tests pass.
