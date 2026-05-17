# Technology Stack

## Frontend

- **Framework:** React 19
- **Language:** TypeScript 5
- **Build tool:** Vite
- **Styling:** Tailwind CSS 3
- **State management:** React Query (TanStack Query v5) + Zustand
- **Routing:** React Router v7
- **Form management:** React Hook Form + Zod
- **HTTP client:** Axios
- **Test runner:** Vitest
- **Component testing:** React Testing Library
- **E2E:** Playwright (optional)

## Backend

- **Framework:** FastAPI 0.111+
- **Language:** Python 3.12
- **ORM:** SQLAlchemy 2 (async)
- **Migrations:** Alembic
- **Auth:** python-jose (JWT) + passlib (bcrypt)
- **Encryption:** cryptography (Fernet)
- **Crypto:** cryptography library (RSA key generation)
- **Validation:** Pydantic v2
- **Test runner:** pytest + pytest-asyncio
- **HTTP test client:** httpx (AsyncClient)

## Database

- **Engine:** PostgreSQL 16
- **Migration tool:** Alembic
- **Connection pool:** asyncpg

## Infrastructure

- **Containerization:** Docker + Docker Compose
- **Environment:** `.env` files (never committed)
- **CI:** GitHub Actions (optional)

## Project layout

```
/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers
│   │   ├── core/         # Config, security, deps
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/          # API client functions
│   │   ├── components/   # Shared components
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand stores
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .harness/
```
