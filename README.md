# Snowflake Key Manager

A web application for generating and managing Snowflake RSA key-pair authentication credentials.

## Features

- Generate 2048-bit or 4096-bit RSA key pairs for Snowflake authentication
- Encrypted storage of private keys
- Snowflake SQL script generation
- Installation instructions and usage examples
- Key rotation workflow
- Audit history
- Dashboard with key status overview

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand
- **Backend:** FastAPI, Python 3.12, SQLAlchemy 2 (async), Alembic
- **Database:** PostgreSQL 16
- **Security:** JWT auth, bcrypt, Fernet encryption for private keys

## Prerequisites

- Docker and Docker Compose
- OR: Python 3.12+ and Node 20+ for local development

## Quick Start

```bash
# Copy environment variables
cp .env.example .env

# Edit .env and set SECRET_KEY and ENCRYPTION_KEY
# Generate ENCRYPTION_KEY: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Start all services
docker compose up
```

- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set up database (PostgreSQL required)
cp ../.env.example ../.env  # Edit DATABASE_URL
alembic upgrade head

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Tests

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd frontend
npm test
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET_KEY` | JWT signing secret (min 32 chars) | Yes |
| `ENCRYPTION_KEY` | Fernet key for private key encryption | Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token lifetime | No (default: 15) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | JWT refresh token lifetime | No (default: 7) |
| `VITE_API_URL` | Backend API URL for frontend | No (default: http://localhost:8000) |

## Security Notes

- Private keys are encrypted with Fernet symmetric encryption before storage
- Never commit `.env` to version control
- Set strong, unique values for `SECRET_KEY` and `ENCRYPTION_KEY` in production
- Store production keys in a secret manager (AWS Secrets Manager, HashiCorp Vault, etc.)

