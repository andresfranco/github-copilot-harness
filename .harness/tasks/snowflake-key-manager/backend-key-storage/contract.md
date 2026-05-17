# Contract: backend-key-storage

## Task

Implement `KeyStorageService` (CRUD + Fernet encryption) and `AuditService`.

## Worker

harness-worker-backend

## Depends on

- db-models
- backend-key-generation

## Touches

- backend/app/services/key_storage_service.py
- backend/app/services/audit_service.py

## KeyStorageService Interface

```python
class KeyStorageService:
    async def create_key(
        self, db: AsyncSession, user_id: UUID, request: KeyGenerationRequest, result: KeyGenerationResult
    ) -> SnowflakeKey:
        """Encrypts private key with Fernet, stores all fields, returns model."""

    async def get_keys(
        self, db: AsyncSession, user_id: UUID,
        environment: Optional[str] = None,
        status: Optional[str] = None,
        snowflake_username: Optional[str] = None,
        key_slot: Optional[str] = None,
        search: Optional[str] = None,
    ) -> list[SnowflakeKey]:
        """Returns keys for user. Never returns encrypted_private_key in the result set."""

    async def get_key(
        self, db: AsyncSession, key_id: UUID, user_id: UUID
    ) -> SnowflakeKey:
        """Returns key for user. Raises HTTP 404 if not found or not owned by user."""

    async def get_private_key(
        self, db: AsyncSession, key_id: UUID, user_id: UUID
    ) -> str:
        """Decrypts and returns private key PEM. Raises 404 if not owned."""

    async def update_key(
        self, db: AsyncSession, key_id: UUID, user_id: UUID, data: KeyUpdateRequest
    ) -> SnowflakeKey:
        """Updates editable metadata fields only."""

    async def revoke_key(
        self, db: AsyncSession, key_id: UUID, user_id: UUID
    ) -> SnowflakeKey:
        """Sets status to REVOKED."""

    async def delete_key(
        self, db: AsyncSession, key_id: UUID, user_id: UUID
    ) -> None:
        """Deletes key record."""

    async def rotate_key(
        self, db: AsyncSession, key_id: UUID, user_id: UUID,
        new_request: KeyGenerationRequest
    ) -> tuple[SnowflakeKey, str]:
        """Creates new key with alternate slot, sets old key status to ROTATING.
        Returns (new_key, cleanup_sql)."""
```

## AuditService Interface

```python
class AuditService:
    async def log(
        self, db: AsyncSession, key_id: UUID, user_id: UUID,
        action: AuditAction,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:

    async def get_audit_history(
        self, db: AsyncSession, key_id: UUID, user_id: UUID
    ) -> list[AuditLog]:
        """Raises 404 if key not owned by user."""
```

## Encryption

- Use `cryptography.fernet.Fernet` with key from `ENCRYPTION_KEY` env var.
- `encrypted_private_key` column stores `Fernet(key).encrypt(pem.encode()).decode()`.
- `get_private_key` decrypts: `Fernet(key).decrypt(stored.encode()).decode()`.

## Key rotation logic

- Alternate slot: RSA_PUBLIC_KEY → RSA_PUBLIC_KEY_2, and vice versa.
- Cleanup SQL:
  - `ALTER USER {username} UNSET RSA_PUBLIC_KEY;` if old slot was RSA_PUBLIC_KEY
  - `ALTER USER {username} UNSET RSA_PUBLIC_KEY_2;` if old slot was RSA_PUBLIC_KEY_2

## Correctness assertions covered

- 23: Private key stored encrypted with Fernet
- 24: Key list scoped to user
- 25: Key list never includes private key values
- 27: Key detail does not return private key by default
- 28: get_private_key returns decrypted PEM
- 29: get_private_key writes PRIVATE_KEY_VIEWED audit log
- 30: update only editable fields
- 31: revoke sets status to REVOKED
- 32: delete removes record
- 33: delete writes KEY_DELETED audit log
- 34: rotation generates new key with alternate slot
- 35/36: alternate slot logic
- 37: cleanup SQL contains UNSET for old slot
- 38: rotation writes KEY_ROTATED audit log
- 39: sensitive actions write audit log entries
- 40: user can get audit history for their key
- 41: user cannot get audit history for another user's key
- 47: key list response body contains no private key PEM
- 48: private key stored encrypted
- 49: Fernet-encrypted values cannot be decoded without key

## Test files

- backend/tests/unit/test_key_storage_service.py
- backend/tests/unit/test_audit_service.py

## Definition of done

- All service methods implemented and tested.
- Fernet encryption/decryption works correctly.
- Audit log entries written for all sensitive actions.
- Authorization enforced (user_id ownership check).
