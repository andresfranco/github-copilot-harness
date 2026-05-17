# Contract: frontend-scaffold

## Task

Create the React 19 + Vite + TypeScript + Tailwind CSS frontend scaffold with routing.

## Worker

harness-worker-frontend

## Depends on

(none)

## Touches

- frontend/package.json
- frontend/vite.config.ts
- frontend/tsconfig.json
- frontend/tailwind.config.ts
- frontend/postcss.config.js
- frontend/index.html
- frontend/src/main.tsx
- frontend/src/App.tsx
- frontend/src/router.tsx
- frontend/src/types/index.ts
- frontend/src/api/client.ts

## Requirements

### Dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.0.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^5.0.0",
  "axios": "^1.7.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "@hookform/resolvers": "^3.0.0"
}
```

### Routes

- `/login` → LoginPage
- `/register` → RegisterPage
- `/` → Dashboard (protected)
- `/keys` → KeyListPage (protected)
- `/keys/new` → GenerateKeyPage (protected)
- `/keys/:id` → KeyDetailsPage (protected)
- `/keys/:id/edit` → EditKeyMetadataPage (protected)
- `/keys/:id/rotate` → RotateKeyPage (protected)
- `/settings` → SettingsPage (protected)

### API client

- Axios instance with base URL from `VITE_API_URL` env var.
- Request interceptor: attach `Authorization: Bearer <token>` from auth store.
- Response interceptor: on 401, clear auth store and redirect to `/login`.

### Types (src/types/index.ts)

Define TypeScript interfaces for:
- `User`
- `SnowflakeKey` (all fields)
- `KeySummary` (list view, no private key)
- `AuditLogEntry`
- `DashboardStats`
- `KeyGenerationRequest`
- `KeyGenerationResponse`

## Correctness assertions covered

- Application renders without crashing.
- Protected routes redirect unauthenticated users to `/login`.

## Test files

- frontend/src/App.test.tsx

## Definition of done

- Vite project starts with `npm run dev`.
- `npm test -- --watchAll=false` runs and passes.
- All routes defined.
- Axios client configured with interceptors.
- TypeScript compiles with no errors.
