# Handoff: infrastructure

## Status

DONE

## Files created

- `docker-compose.yml` — Three-service stack: `db` (PostgreSQL 16 with healthcheck), `backend` (FastAPI via Uvicorn, waits for healthy db), `frontend` (nginx serving React build on port 3000).
- `backend/Dockerfile` — Python 3.12-slim, installs requirements, runs `alembic upgrade head` then `uvicorn` on startup.
- `frontend/Dockerfile` — Multi-stage: Node 20 build (`npm ci && npm run build`), then nginx:alpine serving `/dist` with SPA fallback routing.
- `.env.example` — Template with `DATABASE_URL`, `SECRET_KEY`, `ENCRYPTION_KEY`, JWT expiry settings, and `VITE_API_URL`.
- `README.md` — Full project README covering features, stack, prerequisites, quick start, local dev instructions for both backend and frontend, test commands, environment variable reference, and security notes.

## Notes

- `docker compose up` will start all three services; backend migration runs automatically on container start.
- Backend reachable at http://localhost:8000, frontend at http://localhost:3000, API docs at http://localhost:8000/docs.
- No tests for this task per contract.
