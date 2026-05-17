# Handoff: backend-key-generation

## Status

GREEN — all 26 unit tests pass.

## Files created

- `backend/app/schemas/key.py` — Pydantic v2 schemas:
  - `KeyGenerationRequest` (key_size: int, validated in service layer)
  - `KeyGenerationResult`
  - `KeyUpdateRequest`
  - `KeyResponse` (from_attributes=True)
  - `KeySummaryResponse` (list endpoint, no private key data)

- `backend/app/services/key_generation_service.py` — Service:
  - `KeyGenerationService.generate_key_pair(request) -> KeyGenerationResult`
  - Re-exports `KeyGenerationRequest` so tests can import it from this module
  - Validates key_size ∈ {2048, 4096} (ValueError includes invalid value)
  - Validates passphrase strength when is_encrypted=True (≥12 chars, upper, lower, digit, special)
  - Generates RSA key pair via `cryptography` library
  - PKCS8 PEM for private key (NoEncryption or BestAvailableEncryption)
  - SubjectPublicKeyInfo PEM for public key
  - DER-encoded base64 public key value (no headers, no newlines, no spaces)
  - Snowflake SQL: `ALTER USER {username} SET {key_slot} = '{value}';`
  - Installation instructions with chmod 600 + Windows icacls + 5 secret managers
  - Auth examples: Python snowflake-connector-python, SnowSQL CLI, env var pattern

## Test results

```
26 passed in 1.57s
```

All correctness assertions 9–16, 19–20, 22 verified green.

## Notes for next worker

- `KeyGenerationService` does NOT persist to database — persistence is handled by a separate key storage service.
- `key_size` is `int` in `KeyGenerationRequest` (not `Literal`) so service-layer validation can raise `ValueError` as tests require.
- The `cryptography==42.0.7` backend parameter is omitted (deprecated in ≥3.x).
