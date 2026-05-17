# Contract: backend-key-api

## Task

Implement FastAPI routers for key management and dashboard.

## Worker

harness-worker-backend

## Depends on

- backend-auth
- backend-key-storage

## Touches

- backend/app/api/keys.py
- backend/app/api/dashboard.py

## Key Endpoints

### POST /keys

Auth: required.
Request: KeyGenerationRequest schema.
Response 201: key record (includes private_key_pem for initial display only).
Response 409: alias already exists for this user.
Response 422: validation error.

### GET /keys

Auth: required.
Query params: `environment`, `status`, `snowflake_username`, `key_slot`, `search`, `sort` (default: `-created_at`).
Response 200: list of key summaries (NO private_key_pem).

### GET /keys/{id}

Auth: required.
Response 200: key detail (NO private_key_pem).
Response 404: not found or not owned.

### GET /keys/{id}/private

Auth: required.
Response 200: `{ "private_key_pem": "..." }`.
Response 404: not found or not owned.
Side effect: writes PRIVATE_KEY_VIEWED audit log.

### PUT /keys/{id}

Auth: required.
Request: KeyUpdateRequest (alias, description, expiration_date, snowflake_role).
Response 200: updated key detail.
Response 404: not found or not owned.
Side effect: writes METADATA_UPDATED audit log.

### DELETE /keys/{id}

Auth: required.
Response 204: no content.
Response 404: not found or not owned.
Side effect: writes KEY_DELETED audit log.

### POST /keys/{id}/revoke

Auth: required.
Response 200: updated key detail with status=REVOKED.
Response 404: not found or not owned.
Side effect: writes KEY_REVOKED audit log.

### POST /keys/{id}/rotate

Auth: required.
Request: KeyGenerationRequest (for the new key).
Response 201: `{ "new_key": {...}, "cleanup_sql": "..." }`.
Response 404: not found or not owned.
Side effect: writes KEY_ROTATED audit log.

### GET /keys/{id}/audit

Auth: required.
Response 200: list of audit log entries.
Response 404: not found or not owned.

## Dashboard Endpoint

### GET /dashboard

Auth: required.
Response 200:
```json
{
  "total_keys": 10,
  "active_keys": 7,
  "rotating_keys": 1,
  "expired_keys": 1,
  "revoked_keys": 1,
  "expiring_soon": 2,
  "recent_activity": [...],
  "recently_created": [...]
}
```
"Expiring soon" = keys with expiration_date within 30 days.

## Correctness assertions covered

- 7: Users cannot access other users' keys (404)
- 15/16: SQL script correct per key slot
- 17: Duplicate alias returns 409
- 18: Missing required fields return 422
- 24: Key list scoped to user
- 25: Key list never includes private key values
- 26: Key detail returns all metadata
- 27: Key detail does not return private key by default
- 28/29: /keys/{id}/private returns decrypted key + audit log
- 31: revoke sets status to REVOKED
- 32/33: delete removes record + audit log
- 34-38: rotation behavior
- 42: dashboard returns correct status counts
- 43: dashboard expiring-soon list
- 44: dashboard scoped to authenticated user

## Test files

- backend/tests/integration/test_keys_api.py
- backend/tests/integration/test_dashboard_api.py

## Definition of done

- All endpoints implemented with correct status codes and shapes.
- Integration tests pass against a test database.
- Authorization enforced on all endpoints.
