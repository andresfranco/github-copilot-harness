# Contract: infrastructure

## Task

Create Docker Compose, Dockerfiles, .env.example, and updated README.

## Worker

harness-worker-backend

## Depends on

- backend-auth
- backend-key-api

## Touches

- docker-compose.yml
- backend/Dockerfile
- frontend/Dockerfile
- .env.example
- README.md

## docker-compose.yml

Services:
- `db` — PostgreSQL 16, volume for data, healthcheck.
- `backend` — FastAPI app, depends on db, env from .env file.
- `frontend` — React app served by nginx or vite dev server.

## backend/Dockerfile

- Python 3.12 slim base.
- Install requirements.
- Run alembic upgrade head on start.
- Start uvicorn on port 8000.

## frontend/Dockerfile

- Node 20 base for build.
- npm install && npm run build.
- nginx base for serving.

## .env.example

```
DATABASE_URL=postgresql+asyncpg://user:password@db:5432/snowflake_keys
SECRET_KEY=change-me-to-a-random-secret-key
ENCRYPTION_KEY=change-me-to-a-valid-fernet-key
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
VITE_API_URL=http://localhost:8000
```

## README.md

Include:
- Project description.
- Prerequisites: Docker, Docker Compose.
- Quick start: `docker compose up`.
- Development setup for backend and frontend.
- Environment variables reference.
- Test commands.

## Test files

(none — infrastructure task)

## Definition of done

- `docker compose up` starts all services successfully.
- Backend is accessible at http://localhost:8000.
- Frontend is accessible at http://localhost:3000.
