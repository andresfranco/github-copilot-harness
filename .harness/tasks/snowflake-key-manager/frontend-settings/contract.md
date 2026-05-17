# Contract: frontend-settings

## Task

Implement the Settings page for profile and defaults management.

## Worker

harness-worker-frontend

## Depends on

- frontend-auth

## Touches

- frontend/src/pages/SettingsPage.tsx
- frontend/src/api/settings.ts

## Settings API

- `getSettings(): Promise<UserSettings>`
- `updateSettings(data: Partial<UserSettings>): Promise<UserSettings>`

## SettingsPage

Form sections:
1. **Profile** — full_name, email (read-only).
2. **Snowflake Defaults** — default_snowflake_account, default_environment, default_key_size, default_key_slot, default_encrypted.

On submit: calls `updateSettings`, shows success toast.

## Correctness assertions covered

- 45: User can update profile fields and defaults.

## Test files

- frontend/src/pages/__tests__/SettingsPage.test.tsx

## Definition of done

- Settings page renders and submits.
- Tests pass.
