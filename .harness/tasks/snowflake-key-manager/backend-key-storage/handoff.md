# Handoff: backend-key-storage

## Status: COMPLETE — all tests GREEN

## Files Created

### `backend/app/services/audit_service.py`
- `AuditService.log()` — creates `AuditLog` record, commits session.
- `AuditService._assert_key_ownership()` — queries `SnowflakeKey` by `id` + `user_id`; raises HTTP 404 if not found.
- `AuditService.get_audit_history()` — asserts ownership via `_assert_key_ownership`, then queries and returns audit entries ordered by `created_at DESC`.

### `backend/app/services/key_storage_service.py`
- Module-level `get_fernet()` — reads `ENCRYPTION_KEY` from settings; auto-generates if empty (test mode).
- `KeyStorageService.create_key()` — Fernet-encrypts private key PEM; creates `SnowflakeKey`; audits `KEY_CREATED`. Accepts optional `result` parameter; if `None`, generates key pair internally via `KeyGenerationService`.
- `KeyStorageService.get_keys()` — returns keys scoped to `user_id` with optional filters: `environment`, `status`, `snowflake_username`, `key_slot`, `search`.
- `KeyStorageService.get_key()` — queries by `id`, then enforces ownership (`key.user_id != user_id` → HTTP 404).
- `KeyStorageService.get_private_key()` — verifies ownership, decrypts via Fernet, audits `PRIVATE_KEY_VIEWED`.
- `KeyStorageService.update_key()` — applies `KeyUpdateRequest` fields, commits, audits `METADATA_UPDATED`.
- `KeyStorageService.revoke_key()` — sets `status = "REVOKED"`, commits, audits `KEY_REVOKED`.
- `KeyStorageService.delete_key()` — audits `KEY_DELETED` first, then deletes and commits.
- `KeyStorageService.rotate_key()` — determines alternate slot (`RSA_PUBLIC_KEY` ↔ `RSA_PUBLIC_KEY_2`), creates new key, sets old key `status = "ROTATING"`, returns `(new_key, cleanup_sql)` where cleanup SQL is `ALTER USER {username}\nUNSET {old_slot};`. Audits `KEY_ROTATED`.

## Test Results

```
tests/unit/test_key_storage_service.py::TestCreateKey::test_create_key_encrypted_private_key_differs_from_plain PASSED
tests/unit/test_key_storage_service.py::TestGetPrivateKey::test_get_private_key_returns_decrypted_pem PASSED
tests/unit/test_key_storage_service.py::TestGetKeys::test_get_keys_returns_only_user_keys PASSED
tests/unit/test_key_storage_service.py::TestGetKey::test_get_key_raises_404_for_wrong_user PASSED
tests/unit/test_key_storage_service.py::TestRevokeKey::test_revoke_key_sets_status_to_revoked PASSED
tests/unit/test_key_storage_service.py::TestDeleteKey::test_delete_key_removes_record PASSED
tests/unit/test_key_storage_service.py::TestRotateKey::test_rotate_key_rsa1_creates_rsa2 PASSED
tests/unit/test_key_storage_service.py::TestRotateKey::test_rotate_key_rsa2_creates_rsa1 PASSED
tests/unit/test_key_storage_service.py::TestRotateKey::test_rotate_key_cleanup_sql_unset_rsa1 PASSED
tests/unit/test_key_storage_service.py::TestRotateKey::test_rotate_key_cleanup_sql_unset_rsa2 PASSED
tests/unit/test_audit_service.py::TestAuditServiceLog::test_log_creates_audit_record_with_correct_action PASSED
tests/unit/test_audit_service.py::TestAuditServiceLog::test_log_commits_session PASSED
tests/unit/test_audit_service.py::TestAuditServiceLog::test_log_stores_ip_address_when_provided PASSED
tests/unit/test_audit_service.py::TestAuditServiceGetAuditHistory::test_get_audit_history_returns_entries_for_key PASSED
tests/unit/test_audit_service.py::TestAuditServiceGetAuditHistory::test_get_audit_history_raises_404_for_wrong_user PASSED

15 passed, 2 warnings in 0.06s
```

## Design Notes

- `get_fernet()` is a module-level factory (not a method) so tests can patch it with `patch("app.services.key_storage_service.get_fernet")`.
- Ownership is enforced in `get_key` by checking `key.user_id != user_id` after the DB query, providing defense-in-depth beyond the WHERE clause.
- `_assert_key_ownership` in `AuditService` is a separate async method so tests can patch it independently.
- `rotate_key` calls `self.create_key(db, user_id, new_request)` without a `result`; `create_key` generates the key pair internally via `KeyGenerationService` when `result` is `None`.
