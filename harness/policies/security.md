# Policy: Security

## Authentication

- Use JWT with short expiry (15 minutes) for access tokens.
- Use refresh tokens with longer expiry, stored in HttpOnly cookies.
- Hash passwords with bcrypt (min cost factor 12).
- Never store plain-text passwords.

## Authorization

- Every protected endpoint must verify the JWT.
- Resource ownership checks: user can only access their own data.
- Use dependency injection for auth checks (FastAPI `Depends`).

## Sensitive data

- Encrypt private keys at rest using Fernet (symmetric encryption).
- Store the encryption key in environment variables, never in code.
- Never log private key values.
- Never return private key values in list endpoints.
- Require explicit confirmation before exposing private key values.

## Input validation

- Validate all user inputs at the API boundary.
- Use Pydantic models for request validation in FastAPI.
- Sanitize all strings before storing.
- Reject weak passphrases (min 12 chars, mixed character classes).

## OWASP Top 10 mitigations

- A01 Broken Access Control: ownership checks on all key endpoints.
- A02 Cryptographic Failures: encrypt sensitive fields, use HTTPS.
- A03 Injection: use ORM (SQLAlchemy), parameterized queries only.
- A04 Insecure Design: threat-modeled key storage and access flow.
- A05 Security Misconfiguration: no defaults in production; env vars.
- A06 Vulnerable Components: pin dependency versions; audit regularly.
- A07 Auth Failures: JWT, bcrypt, refresh token rotation.
- A08 Software Integrity: no untrusted deserialization.
- A09 Logging Failures: audit log all sensitive actions.
- A10 SSRF: no user-controlled URLs in server-side requests.

## Environment variables required

```
DATABASE_URL=
SECRET_KEY=
ENCRYPTION_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```
