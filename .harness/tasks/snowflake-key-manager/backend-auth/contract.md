# Contract: backend-auth

## Task

Implement user authentication: register, login, logout, get/update profile. JWT access tokens + bcrypt passwords.

## Worker

harness-worker-backend

## Depends on

- db-models

## Touches

- backend/app/core/config.py
- backend/app/core/security.py
- backend/app/core/deps.py
- backend/app/schemas/user.py
- backend/app/schemas/token.py
- backend/app/services/auth_service.py
- backend/app/api/auth.py
- backend/app/main.py
- backend/requirements.txt

## API Endpoints

### POST /auth/register

Request:
```json
{ "email": "user@example.com", "password": "SecurePass123!", "full_name": "Alice" }
```
Response 201:
```json
{ "id": "uuid", "email": "user@example.com", "full_name": "Alice", "created_at": "..." }
```
Response 400: email already registered.

### POST /auth/login

Request (form): `username=user@example.com&password=SecurePass123!`
Response 200:
```json
{ "access_token": "jwt", "token_type": "bearer" }
```
Response 401: incorrect credentials.

### POST /auth/logout

Header: `Authorization: Bearer <token>`
Response 200: `{ "message": "Logged out" }`

### GET /auth/me

Header: `Authorization: Bearer <token>`
Response 200: user profile object (no password).

### PUT /auth/me

Header: `Authorization: Bearer <token>`
Request: partial user fields (full_name, defaults).
Response 200: updated user profile.

## Correctness assertions covered

- 1: User can register with unique email.
- 2: Duplicate email returns 400.
- 3: Login with correct credentials returns JWT.
- 4: Login with wrong password returns 401.
- 5: Protected endpoint without token returns 401.
- 6: Protected endpoint with expired token returns 401.
- 7: User cannot access another user's resource (enforced via deps).
- 8: Passwords stored as bcrypt hashes.

## Security requirements

- Passwords hashed with `passlib` bcrypt, min cost 12.
- JWT signed with `SECRET_KEY` env var.
- Access token expiry: `ACCESS_TOKEN_EXPIRE_MINUTES` env var (default 15).
- Dependency `get_current_user` raises HTTP 401 if token invalid/expired.

## Test files

- backend/tests/unit/test_auth_service.py
- backend/tests/integration/test_auth_api.py

## Definition of done

- All endpoints return correct status codes and response shapes.
- Tests cover happy paths and all error paths.
- Passwords are never stored or returned in plain text.
