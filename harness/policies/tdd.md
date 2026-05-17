# Policy: TDD

All code in this project is written test-first.

## Rules

1. Tests must be written before implementation.
2. Tests must fail (RED) before implementation begins.
3. Implementation makes tests GREEN — nothing more.
4. Refactor only after tests are GREEN.
5. Do not add code that has no test coverage.

## Test locations

- Backend unit tests: `backend/tests/unit/`
- Backend integration tests: `backend/tests/integration/`
- Frontend unit tests: `frontend/src/**/__tests__/` or `*.test.tsx`
- Database migration tests: `backend/tests/migrations/`

## Test commands

- Backend: `cd backend && pytest`
- Frontend: `cd frontend && npm test -- --watchAll=false`

## What to test

- All service functions.
- All API endpoint behaviors (happy path + error paths).
- All validation rules.
- All authorization rules (user cannot access another user's data).
- All encryption/decryption of sensitive values.
- All audit log entries.
