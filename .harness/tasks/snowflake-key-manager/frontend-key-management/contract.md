# Contract: frontend-key-management

## Task

Implement Key List, Key Details, Edit Key Metadata, and Rotate Key pages with components.

## Worker

harness-worker-frontend

## Depends on

- frontend-generate-key

## Touches

- frontend/src/pages/KeyListPage.tsx
- frontend/src/pages/KeyDetailsPage.tsx
- frontend/src/pages/EditKeyMetadataPage.tsx
- frontend/src/pages/RotateKeyPage.tsx
- frontend/src/components/KeyListTable.tsx
- frontend/src/components/KeyDetailsTabView.tsx
- frontend/src/components/ConfirmationDialog.tsx
- frontend/src/components/StatusBadge.tsx

## KeyListPage

- Fetches and displays list of user's keys via `getKeys(filters)`.
- Search bar filters by alias/username.
- Filter dropdowns: environment, status, snowflake_username, key_slot.
- Sort by creation date (newest first by default).
- Empty state when no keys.
- Loading state while fetching.
- Each row links to key details.
- StatusBadge shows color-coded status.

## KeyListTable

Props: `{ keys: KeySummary[], onRowClick: (id: string) => void }`
Columns: alias, snowflake_username, environment, key_slot, key_size, status, created_at.
Does NOT show private key values.

## StatusBadge

Props: `{ status: KeyStatus }`
Color map:
- ACTIVE → green
- ROTATING → blue
- EXPIRED → yellow
- REVOKED → red

## KeyDetailsPage

Tabbed view (KeyDetailsTabView) with tabs:
- Overview: all key metadata fields.
- Private Key: SensitiveValueDisplay + CopyButton (confirm) + DownloadButton (.p8, confirm).
- Public Key: value display + CopyButton + DownloadButton (.pub).
- Snowflake SQL Script: code block + CopyButton + DownloadButton (.sql).
- Installation Instructions: formatted text + CopyButton + DownloadButton (.txt).
- Authentication Examples: Python/SnowSQL/env var examples + CopyButton.
- Audit History: table of audit log entries.

Action buttons: Edit Metadata, Rotate Key, Revoke Key (confirm), Delete Key (confirm).

## EditKeyMetadataPage

Form to edit: alias, description, expiration_date, snowflake_role.
On submit: calls `updateKey`, shows success message, redirects to key details.

## RotateKeyPage

Guided workflow:
1. Shows old key info and suggests alternate key slot.
2. Pre-fills key generation form with alternate slot.
3. On submit: calls `rotateKey`, shows new key outputs + cleanup SQL.
4. User can copy/download cleanup SQL.
5. User is prompted to mark old key as revoked.

## ConfirmationDialog

Props: `{ title: string, message: string, onConfirm: () => void, onCancel: () => void, isDangerous?: boolean }`
Shows modal with title, message, Cancel and Confirm buttons.
If `isDangerous=true`, Confirm button is red.

## Correctness assertions covered

- Key list shows only user's keys.
- Key list does not show private key values.
- Private key requires confirmation before reveal/copy/download.
- Revoke requires confirmation.
- Delete requires confirmation.
- Rotation uses alternate key slot.

## Test files

- frontend/src/pages/__tests__/KeyListPage.test.tsx
- frontend/src/pages/__tests__/KeyDetailsPage.test.tsx

## Definition of done

- All pages render and function with mocked API data.
- Tests pass.
