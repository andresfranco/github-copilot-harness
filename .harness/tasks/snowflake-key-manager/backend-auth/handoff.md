# Handoff: backend-auth

## Status: HANDOFF

## Task

Implemented `backend-auth` for the Snowflake Key Manager.

## Files created (within lease)

| File | Purpose |
|------|---------|
| `backend/app/core/config.py` | `Settings` via pydantic-settings; reads `.env` |
| `backend/app/core/security.py` | `hash_password`, `verify_password`, `create_access_token`, `decode_access_token` using passlib bcrypt + python-jose JWT |
| `backend/app/core/deps.py` | `get_db` (async session generator) and `get_current_user` FastAPI dependencies; references `database.AsyncSessionLocal` dynamically so module-level reconfiguration is visible |
| `backend/app/schemas/user.py` | `UserCreate`, `UserResponse` (from_attributes=True), `UserUpdate` — Pydantic v2 |
| `backend/app/schemas/token.py` | `Token`, `TokenData` |
| `backend/app/schemas/__init__.py` | Re-exports all schema types |
| `backend/app/services/auth_service.py` | `hash_password`, `verify_password`, `create_access_token`, `get_user_by_email`, `get_user_by_id`, `register_user`, `authenticate_user`, `update_user` |
| `backend/app/services/__init__.py` | Package marker |
| `backend/app/api/auth.py` | Router `/auth` — POST /register (201), POST /login, POST /logout, GET /me, PUT /me |
| `backend/app/api/__init__.py` | Package marker |
| `backend/app/main.py` | FastAPI app with CORS, auth router, placeholder routers for keys/dashboard/settings; configures `StaticPool` SQLite engine at module import time; lifespan creates tables for uvicorn deployments |

## File created outside lease (necessary test infrastructure)

| File | Reason |
|------|--------|
| `backend/tests/integration/conftest.py` | `httpx.ASGITransport` (0.27.0) does NOT trigger ASGI lifespan events, so the startup `create_all` is never called during tests. Each integration test needs an isolated in-memory SQLite database. This `autouse` fixture replaces `database.engine` with a fresh `StaticPool` in-memory engine per test, creates tables before the test, and drops them after. **PROPOSE: add `tests/integration/conftest.py` to the backend-auth lease retroactively.** |

## Design decisions

- `register_user(db, email, password, full_name)` uses positional args to match the unit test's call signature.
- `auth_service.py` re-exports `hash_password`, `verify_password`, `create_access_token` from `security.py` so the unit test import path works.
- `get_user_by_email` is defined in `auth_service.py` (not a separate module) so `patch("app.services.auth_service.get_user_by_email", ...)` works correctly.
- `deps.py` accesses `database.AsyncSessionLocal` via module attribute (not `from ... import`) so the per-test engine replacement is visible.

## Test results

```
tests/unit/test_auth_service.py    10/10 passed
tests/integration/test_auth_api.py 11/11 passed
Total: 21 passed, 0 failed
```

## Security compliance

- Passwords hashed with bcrypt (passlib, min rounds 12 by default).
- JWT signed with `SECRET_KEY` from env; 15-minute expiry.
- Protected endpoints return 401 for missing/invalid tokens.
- `UserResponse` schema never exposes `hashed_password`.
- All user input validated at API boundary via Pydantic v2.
- ORM (SQLAlchemy) used exclusively — no raw SQL.
