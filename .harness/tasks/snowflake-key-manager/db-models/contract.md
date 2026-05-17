# Contract: db-models

## Task

Create SQLAlchemy 2 async models and Alembic initial migration for the Snowflake Key Manager.

## Worker

harness-worker-database

## Depends on

(none)

## Touches

- backend/app/models/user.py
- backend/app/models/snowflake_key.py
- backend/app/models/audit_log.py
- backend/app/models/__init__.py
- backend/alembic/versions/001_initial_schema.py
- backend/alembic/env.py
- backend/alembic.ini

## Correctness assertions covered

- 8: Passwords stored as hashes (model has `hashed_password`, no `password` field)
- 23: Private key stored encrypted (model has `encrypted_private_key`, no `private_key_pem` plain field)
- 48: Private key stored encrypted in DB
- 49: Fernet-encrypted values in DB

## Schema required

### users table

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| hashed_password | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | nullable |
| default_snowflake_account | VARCHAR(255) | nullable |
| default_environment | VARCHAR(20) | nullable |
| default_key_size | INTEGER | DEFAULT 2048 |
| default_key_slot | VARCHAR(30) | nullable |
| default_encrypted | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | NOT NULL, default now() |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() |

### snowflake_keys table

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| user_id | UUID | FK users.id, NOT NULL, indexed |
| alias | VARCHAR(255) | NOT NULL |
| snowflake_account | VARCHAR(255) | NOT NULL |
| snowflake_username | VARCHAR(255) | NOT NULL |
| snowflake_role | VARCHAR(255) | nullable |
| environment | VARCHAR(20) | NOT NULL |
| key_slot | VARCHAR(30) | NOT NULL |
| key_size | INTEGER | NOT NULL |
| is_encrypted | BOOLEAN | NOT NULL, DEFAULT false |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' |
| encrypted_private_key | TEXT | NOT NULL |
| public_key_pem | TEXT | NOT NULL |
| public_key_value | TEXT | NOT NULL |
| snowflake_sql | TEXT | NOT NULL |
| installation_instructions | TEXT | NOT NULL |
| auth_examples | TEXT | NOT NULL |
| expiration_date | DATE | nullable |
| description | TEXT | nullable |
| created_at | TIMESTAMPTZ | NOT NULL, default now() |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() |
| last_viewed_at | TIMESTAMPTZ | nullable |
| last_downloaded_at | TIMESTAMPTZ | nullable |
| UNIQUE | (user_id, alias) | |

### audit_logs table

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| key_id | UUID | FK snowflake_keys.id, NOT NULL, indexed |
| user_id | UUID | FK users.id, NOT NULL, indexed |
| action | VARCHAR(50) | NOT NULL |
| ip_address | VARCHAR(45) | nullable |
| user_agent | TEXT | nullable |
| created_at | TIMESTAMPTZ | NOT NULL, default now() |

## Enums (Python)

```python
class Environment(str, Enum):
    DEV = "DEV"
    TEST = "TEST"
    QA = "QA"
    PROD = "PROD"
    SANDBOX = "SANDBOX"
    OTHER = "OTHER"

class KeySlot(str, Enum):
    RSA_PUBLIC_KEY = "RSA_PUBLIC_KEY"
    RSA_PUBLIC_KEY_2 = "RSA_PUBLIC_KEY_2"

class KeyStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ROTATING = "ROTATING"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"

class AuditAction(str, Enum):
    KEY_CREATED = "KEY_CREATED"
    PRIVATE_KEY_VIEWED = "PRIVATE_KEY_VIEWED"
    PRIVATE_KEY_COPIED = "PRIVATE_KEY_COPIED"
    PRIVATE_KEY_DOWNLOADED = "PRIVATE_KEY_DOWNLOADED"
    PUBLIC_KEY_COPIED = "PUBLIC_KEY_COPIED"
    PUBLIC_KEY_DOWNLOADED = "PUBLIC_KEY_DOWNLOADED"
    SQL_COPIED = "SQL_COPIED"
    SQL_DOWNLOADED = "SQL_DOWNLOADED"
    INSTRUCTIONS_COPIED = "INSTRUCTIONS_COPIED"
    INSTRUCTIONS_DOWNLOADED = "INSTRUCTIONS_DOWNLOADED"
    METADATA_UPDATED = "METADATA_UPDATED"
    KEY_ROTATED = "KEY_ROTATED"
    KEY_REVOKED = "KEY_REVOKED"
    KEY_DELETED = "KEY_DELETED"
```

## Test files

- backend/tests/unit/test_models.py
- backend/tests/migrations/test_migration_001.py

## Definition of done

- All model classes defined with correct columns and relationships.
- Alembic migration creates all three tables.
- Migration is reversible (downgrade implemented).
- Unit tests pass.
