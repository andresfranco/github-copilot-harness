# Contract: frontend-auth

## Task

Implement Login and Register pages, auth API client, auth store, and ProtectedRoute component.

## Worker

harness-worker-frontend

## Depends on

- frontend-scaffold

## Touches

- frontend/src/api/auth.ts
- frontend/src/hooks/useAuth.ts
- frontend/src/store/authStore.ts
- frontend/src/pages/LoginPage.tsx
- frontend/src/pages/RegisterPage.tsx
- frontend/src/components/ProtectedRoute.tsx

## Auth Store (Zustand)

```typescript
interface AuthState {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  logout: () => void
}
```
Persist token to localStorage.

## API functions (src/api/auth.ts)

- `register(data: RegisterRequest): Promise<User>`
- `login(email: string, password: string): Promise<{ access_token: string }>`
- `logout(): Promise<void>`
- `getMe(): Promise<User>`

## LoginPage

- Email and password fields with validation.
- On submit: call `login`, store token, redirect to `/`.
- Show error message on 401.
- Link to `/register`.

## RegisterPage

- Email, password, confirm password, full name fields.
- On submit: call `register`, then auto-login, redirect to `/`.
- Show error on duplicate email.
- Link to `/login`.

## ProtectedRoute

- Reads token from auth store.
- If no token, redirects to `/login`.
- Otherwise renders children.

## useAuth hook

- Returns `{ user, login, logout, isAuthenticated }`.
- On mount, if token exists but user is null, calls `getMe` to populate user.

## Correctness assertions covered

- Unauthenticated users redirected to /login.
- Login form submits credentials and stores token.
- Register form submits and auto-logs in.

## Test files

- frontend/src/pages/__tests__/LoginPage.test.tsx
- frontend/src/pages/__tests__/RegisterPage.test.tsx
- frontend/src/hooks/__tests__/useAuth.test.ts

## Definition of done

- Login and Register pages render and function.
- ProtectedRoute blocks unauthenticated access.
- Tests pass with mocked API.
