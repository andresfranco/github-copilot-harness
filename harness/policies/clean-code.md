# Policy: Clean Code

## Python (Backend)

- Follow PEP 8.
- Use type annotations on all function signatures.
- Functions must be short and single-purpose.
- No magic strings; use enums or constants.
- No commented-out code.
- Raise specific exceptions, not bare `Exception`.
- Use dependency injection for testability.

## TypeScript/React (Frontend)

- Use functional components with hooks.
- No `any` type; use proper TypeScript types.
- Components must be small and single-purpose.
- Keep business logic out of components; use custom hooks.
- No inline styles; use CSS modules or Tailwind.
- No `console.log` in production code.

## SQL / Database

- Use Alembic migrations for all schema changes.
- Migration files must be reversible (have `downgrade`).
- Index foreign keys.
- No raw SQL in application code; use SQLAlchemy ORM.

## General

- No dead code.
- No TODO comments in committed code.
- All names must be descriptive and unambiguous.
- Prefer explicit over implicit.
