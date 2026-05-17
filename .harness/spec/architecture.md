# Architecture: Snowflake Key Pair Manager

## System Overview

A web application that lets authenticated users generate, store, and manage Snowflake RSA key-pair authentication credentials. The system consists of a React 19 frontend, a FastAPI backend, and a PostgreSQL database.

## Components

### Frontend (React 19 + TypeScript)

- **Auth pages:** Login, Register
- **Dashboard:** Stats cards (total/active/rotating/expired/revoked keys, expiring soon, recent activity)
- **Generate Key page:** Form with all key generation inputs and validation
- **Key List page:** Searchable, filterable, sortable table of keys
- **Key Details page:** Tabbed view with Overview, Private Key, Public Key, SQL Script, Instructions, Auth Examples, Audit History
- **Edit Key Metadata page**
- **Rotate Key page:** Guided rotation workflow
- **Settings page:** Profile + defaults management
- **Shared components:** ConfirmationDialog, SensitiveValueDisplay, CopyButton, DownloadButton, StatusBadge, LoadingState, EmptyState

### Backend (FastAPI + Python 3.12)

#### Routers

- `POST /auth/register` — register new user
- `POST /auth/login` — login, return JWT
- `POST /auth/logout` — invalidate refresh token
- `GET /auth/me` — get current user profile
- `PUT /auth/me` — update profile + settings

- `POST /keys` — generate new key pair
- `GET /keys` — list user's keys (no private key values)
- `GET /keys/{id}` — get key details (no private key by default)
- `PUT /keys/{id}` — update key metadata
- `DELETE /keys/{id}` — delete key
- `POST /keys/{id}/revoke` — mark as revoked
- `POST /keys/{id}/rotate` — start rotation workflow
- `GET /keys/{id}/private` — get decrypted private key (audit logged)
- `GET /keys/{id}/audit` — get audit history

- `GET /dashboard` — get dashboard stats

#### Services

- `AuthService` — user registration, login, JWT management
- `KeyGenerationService` — RSA key pair generation (2048/4096), PEM formatting, SQL script generation, instructions generation, auth examples generation
- `KeyStorageService` — CRUD for key records, Fernet encryption/decryption of private key values
- `AuditService` — write and read audit log entries
- `DashboardService` — aggregate stats for current user

#### Security

- JWT access tokens (15 min expiry) via `Authorization: Bearer` header
- Refresh tokens in HttpOnly cookie
- Passwords hashed with bcrypt
- Private keys encrypted with Fernet before DB storage
- All endpoints require authentication except `/auth/login` and `/auth/register`
- Resource ownership enforced: users can only access their own keys

### Database (PostgreSQL 16)

#### Tables

**users**
- id (UUID, PK)
- email (VARCHAR, unique, not null)
- hashed_password (VARCHAR, not null)
- full_name (VARCHAR)
- default_snowflake_account (VARCHAR)
- default_environment (ENUM)
- default_key_size (INTEGER, default 2048)
- default_key_slot (ENUM)
- default_encrypted (BOOLEAN, default false)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

**snowflake_keys**
- id (UUID, PK)
- user_id (UUID, FK → users.id, indexed)
- alias (VARCHAR, not null)
- snowflake_account (VARCHAR, not null)
- snowflake_username (VARCHAR, not null)
- snowflake_role (VARCHAR, nullable)
- environment (ENUM: DEV, TEST, QA, PROD, SANDBOX, OTHER)
- key_slot (ENUM: RSA_PUBLIC_KEY, RSA_PUBLIC_KEY_2)
- key_size (INTEGER: 2048 or 4096)
- is_encrypted (BOOLEAN)
- status (ENUM: ACTIVE, ROTATING, EXPIRED, REVOKED)
- encrypted_private_key (TEXT, not null) — Fernet encrypted PEM
- public_key_pem (TEXT, not null)
- public_key_value (TEXT, not null) — stripped value for Snowflake SQL
- snowflake_sql (TEXT, not null)
- installation_instructions (TEXT, not null)
- auth_examples (TEXT, not null)
- expiration_date (DATE, nullable)
- description (TEXT, nullable)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- last_viewed_at (TIMESTAMPTZ, nullable)
- last_downloaded_at (TIMESTAMPTZ, nullable)
- UNIQUE (user_id, alias)

**audit_logs**
- id (UUID, PK)
- key_id (UUID, FK → snowflake_keys.id, indexed)
- user_id (UUID, FK → users.id, indexed)
- action (ENUM: KEY_CREATED, PRIVATE_KEY_VIEWED, PRIVATE_KEY_COPIED, PRIVATE_KEY_DOWNLOADED, PUBLIC_KEY_COPIED, PUBLIC_KEY_DOWNLOADED, SQL_COPIED, SQL_DOWNLOADED, INSTRUCTIONS_COPIED, INSTRUCTIONS_DOWNLOADED, METADATA_UPDATED, KEY_ROTATED, KEY_REVOKED, KEY_DELETED)
- ip_address (VARCHAR, nullable)
- user_agent (VARCHAR, nullable)
- created_at (TIMESTAMPTZ)

## Data Flow: Key Generation

1. Frontend submits key generation form.
2. Backend validates all inputs.
3. Backend generates RSA key pair using `cryptography` library.
4. Backend generates PEM private key (optionally encrypted with passphrase).
5. Backend generates PEM public key.
6. Backend strips PEM headers/footers/whitespace for Snowflake SQL value.
7. Backend generates ALTER USER SQL script.
8. Backend generates installation instructions text.
9. Backend generates auth examples (Python, SnowSQL, env vars).
10. Backend encrypts private key PEM with Fernet before storing.
11. Backend stores key record in DB.
12. Backend writes KEY_CREATED audit log entry.
13. Backend returns key record (with private key for initial display only).

## Security Boundaries

- Private key is only returned:
  - Once at key creation time (for the user to download/copy).
  - On explicit `GET /keys/{id}/private` request (audit logged).
- The key list endpoint never returns private key values.
- Fernet encryption key is stored only in environment variables.
- All DB queries use parameterized statements (SQLAlchemy ORM).
