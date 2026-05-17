# Contract: frontend-generate-key

## Task

Implement the Generate Key page with form, validation, and outputs display.

## Worker

harness-worker-frontend

## Depends on

- frontend-auth

## Touches

- frontend/src/api/keys.ts
- frontend/src/pages/GenerateKeyPage.tsx
- frontend/src/components/KeyGenerationForm.tsx
- frontend/src/components/KeyOutputsDisplay.tsx
- frontend/src/components/SensitiveValueDisplay.tsx
- frontend/src/components/CopyButton.tsx
- frontend/src/components/DownloadButton.tsx

## Keys API (src/api/keys.ts)

- `generateKey(data: KeyGenerationRequest): Promise<KeyGenerationResponse>`
- `getKeys(filters?: KeyFilters): Promise<KeySummary[]>`
- `getKey(id: string): Promise<SnowflakeKey>`
- `getPrivateKey(id: string): Promise<{ private_key_pem: string }>`
- `updateKey(id: string, data: Partial<KeyUpdateRequest>): Promise<SnowflakeKey>`
- `revokeKey(id: string): Promise<SnowflakeKey>`
- `deleteKey(id: string): Promise<void>`
- `rotateKey(id: string, data: KeyGenerationRequest): Promise<RotateKeyResponse>`
- `getAuditHistory(id: string): Promise<AuditLogEntry[]>`

## KeyGenerationForm

Fields:
- alias (text, required)
- snowflake_account (text, required)
- snowflake_username (text, required)
- snowflake_role (text, optional)
- environment (select: DEV/TEST/QA/PROD/SANDBOX/OTHER, required)
- key_slot (select: RSA_PUBLIC_KEY / RSA_PUBLIC_KEY_2, required)
- key_size (radio: 2048 / 4096, required)
- is_encrypted (checkbox)
- passphrase (password, shown/required only when is_encrypted=true)
- confirm_passphrase (password, shown/required only when is_encrypted=true)
- expiration_date (date, optional)
- description (textarea, optional)

Validation (Zod + React Hook Form):
- alias required
- snowflake_account required
- snowflake_username required
- environment required
- key_slot required
- key_size must be 2048 or 4096
- passphrase required if is_encrypted
- passphrase === confirm_passphrase
- passphrase strength: min 12 chars, mixed character classes

Behavior:
- Pre-fill from user settings defaults if available.
- Show loading state while submitting.
- On success, show KeyOutputsDisplay.
- On error, show error message.

## KeyOutputsDisplay

Displays after successful generation:
- Private Key (masked by default, SensitiveValueDisplay with confirm-before-reveal)
- Public Key (visible)
- Snowflake Public Key Value (visible)
- Snowflake SQL Script (visible)
- Installation Instructions (visible)
- Authentication Examples (visible)
- CopyButton for each section
- DownloadButton for: private key (.p8), public key (.pub), SQL (.sql), instructions (.txt)

## SensitiveValueDisplay

Props: `{ value: string, label: string }`
- Shows masked placeholder by default.
- "Reveal" button shows a confirmation dialog warning.
- After confirmation, shows value with auto-hide after 30 seconds.
- While revealed, shows "Hide" button.

## CopyButton

Props: `{ value: string, label?: string, requireConfirmation?: boolean }`
- If requireConfirmation=true, shows a warning dialog before copying.
- Shows success feedback after copy.

## DownloadButton

Props: `{ value: string, filename: string, mimeType: string, requireConfirmation?: boolean }`
- If requireConfirmation=true, shows warning dialog before download.
- Triggers browser file download.

## Correctness assertions covered

- Form validates all required fields.
- Passphrase match validation.
- Passphrase strength validation.
- Private key masked by default.
- Explicit confirmation required to reveal/copy/download private key.

## Test files

- frontend/src/pages/__tests__/GenerateKeyPage.test.tsx
- frontend/src/components/__tests__/KeyGenerationForm.test.tsx

## Definition of done

- Form renders and validates.
- Submission calls API and shows outputs.
- Sensitive values masked and require confirmation.
- Tests pass.
