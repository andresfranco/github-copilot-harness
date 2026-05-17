# Handoff: frontend-settings

## Status

DONE — all tests GREEN.

## Files Created / Modified

| File | Action |
|------|--------|
| `frontend/src/api/settings.ts` | Created |
| `frontend/src/pages/SettingsPage.tsx` | Implemented (was stub) |
| `frontend/src/pages/__tests__/SettingsPage.test.tsx` | Created |

## What was implemented

### `frontend/src/api/settings.ts`
- `UserSettings` and `UserSettingsUpdate` interfaces
- `getSettings()` — GET `/settings`
- `updateSettings(data)` — PUT `/settings`

### `frontend/src/pages/SettingsPage.tsx`
- Loads current settings via `useQuery(['settings'])`
- React Hook Form + Zod validation
- **Profile section**: `full_name` (text input), `email` (read-only)
- **Snowflake Defaults section**: `default_snowflake_account`, `default_environment` (select: DEV/TEST/QA/PROD/SANDBOX/OTHER), `default_key_size` (radio: 2048/4096), `default_key_slot` (select: RSA_PUBLIC_KEY/RSA_PUBLIC_KEY_2), `default_encrypted` (checkbox)
- On submit: `useMutation` → `updateSettings`, invalidates `['settings']` query, shows success message for 3 s

### `frontend/src/pages/__tests__/SettingsPage.test.tsx`
- 4 tests covering: profile section renders, defaults section renders, full_name field present, default_environment select present
- Mocks `../../api/settings` via `vi.mock`

## Test results

```
Test Files  10 passed (10)
      Tests  27 passed (27)
```

All pre-existing tests continue to pass.

## Correctness assertion covered

- CA-45: User can update profile fields and defaults.
