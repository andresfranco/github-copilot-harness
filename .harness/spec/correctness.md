# Correctness Assertions

These are the observable correctness conditions the system must satisfy. All must be testable.

## Authentication

1. A user can register with a unique email and password.
2. Registration with a duplicate email returns HTTP 400.
3. Login with correct credentials returns a JWT access token.
4. Login with wrong password returns HTTP 401.
5. A protected endpoint returns HTTP 401 when no token is provided.
6. A protected endpoint returns HTTP 401 when token is expired.
7. A user cannot access another user's resources (returns HTTP 403 or 404).
8. Passwords are stored as bcrypt hashes, never plain text.

## Key Generation

9. A key can be generated with all required fields and a 2048-bit size.
10. A key can be generated with all required fields and a 4096-bit size.
11. An unencrypted private key is returned in PEM format starting with `-----BEGIN PRIVATE KEY-----`.
12. An encrypted private key is returned in PEM format starting with `-----BEGIN ENCRYPTED PRIVATE KEY-----`.
13. The public key is returned in PEM format starting with `-----BEGIN PUBLIC KEY-----`.
14. The Snowflake public key value contains no PEM headers, footers, spaces, or line breaks.
15. The SQL script for RSA_PUBLIC_KEY contains `SET RSA_PUBLIC_KEY`.
16. The SQL script for RSA_PUBLIC_KEY_2 contains `SET RSA_PUBLIC_KEY_2`.
17. Key alias must be unique per user; duplicate alias returns HTTP 409.
18. Missing required fields (alias, username, account, environment, key_slot) return HTTP 422.
19. Invalid key size (not 2048 or 4096) returns HTTP 422.
20. Encrypted key with no passphrase returns HTTP 422.
21. Passphrase mismatch returns HTTP 422.
22. Weak passphrase (< 12 chars or no mixed character classes) returns HTTP 422.
23. The private key returned on creation is encrypted with Fernet in the database.

## Key Management

24. Key list returns only keys belonging to the authenticated user.
25. Key list does not include private key values.
26. Key detail endpoint returns all key metadata.
27. Key detail endpoint does not return private key value by default.
28. Private key endpoint returns decrypted PEM private key.
29. Private key endpoint writes a PRIVATE_KEY_VIEWED audit log entry.
30. Updating key metadata updates only editable fields.
31. Revoking a key sets status to REVOKED.
32. Deleting a key removes the key record.
33. Deleting a key writes a KEY_DELETED audit log entry.

## Key Rotation

34. Rotation generates a new key pair with the alternate key slot.
35. If old key uses RSA_PUBLIC_KEY, new key uses RSA_PUBLIC_KEY_2.
36. If old key uses RSA_PUBLIC_KEY_2, new key uses RSA_PUBLIC_KEY.
37. Cleanup SQL contains UNSET for the old key slot.
38. Rotation writes a KEY_ROTATED audit log entry.

## Audit Log

39. Every sensitive action writes an audit log entry with the correct action type.
40. A user can retrieve the audit history for their own key.
41. A user cannot retrieve audit history for another user's key.

## Dashboard

42. Dashboard returns correct counts for each key status.
43. Dashboard returns keys expiring within 30 days.
44. Dashboard stats are scoped to the authenticated user.

## Settings

45. User can update profile fields (full_name, defaults).
46. Updated defaults are applied as pre-fill values on key generation form.

## Sensitive Data

47. Key list endpoint response body contains no private key PEM values.
48. Private key is stored encrypted in the DB (not plain text).
49. Fernet-encrypted values in DB cannot be decoded without the encryption key.
