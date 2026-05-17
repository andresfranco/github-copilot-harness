# Handoff: frontend-auth

## Status

DONE — all tests green.

## Files created / modified

| File | Action |
|------|--------|
| `frontend/src/api/auth.ts` | Created — `register`, `login`, `logout`, `getMe` API functions |
| `frontend/src/hooks/useAuth.ts` | Created — `useAuth` hook returning `{ user, login, logout, register, isAuthenticated }` |
| `frontend/src/store/authStore.ts` | Updated — imports `User` from `../types` instead of local interface |
| `frontend/src/pages/LoginPage.tsx` | Replaced stub — React Hook Form + Zod, email/password, error on 401, link to /register |
| `frontend/src/pages/RegisterPage.tsx` | Replaced stub — email/password/confirm/full_name, password-match validation, auto-login on success |
| `frontend/src/components/ProtectedRoute.tsx` | Unchanged — already correct |
| `frontend/src/pages/__tests__/LoginPage.test.tsx` | Created |
| `frontend/src/pages/__tests__/RegisterPage.test.tsx` | Created |
| `frontend/src/hooks/__tests__/useAuth.test.ts` | Created |

## Test results

```
✓ src/hooks/__tests__/useAuth.test.ts (4 tests)
✓ src/pages/__tests__/LoginPage.test.tsx (4 tests)
✓ src/pages/__tests__/RegisterPage.test.tsx (3 tests)
All 14 tests pass (5 test files)
```

## Notes

- `useAuth` uses `useNavigate` from react-router-dom; tests mock the router via `MemoryRouter` wrapper.
- Token persisted via `zustand/persist` under key `auth-storage`.
- On mount, if token exists but user is null (e.g. after page refresh), `getMe()` is called to rehydrate the user object.
