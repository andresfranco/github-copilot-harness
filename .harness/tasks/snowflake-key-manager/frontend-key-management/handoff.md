# Handoff: frontend-key-management

## Status: HANDOFF

## Worker: harness-worker-frontend

## Tests

All tests GREEN:
- `src/pages/__tests__/KeyListPage.test.tsx` (2 tests)
- `src/pages/__tests__/KeyDetailsPage.test.tsx` (2 tests)

## Files Created / Updated

- `frontend/src/components/StatusBadge.tsx` — Color-coded badge: ACTIVE→green, ROTATING→blue, EXPIRED→yellow, REVOKED→red
- `frontend/src/components/KeyListTable.tsx` — Table with columns: alias, snowflake_username, environment, key_slot, key_size, status, created_at; rows clickable
- `frontend/src/components/KeyDetailsTabView.tsx` — Tabbed view with 7 tabs: Overview, Private Key, Public Key, Snowflake SQL Script, Installation Instructions, Authentication Examples, Audit History
- `frontend/src/pages/KeyListPage.tsx` — Search bar + filter dropdowns (environment, status, key_slot), useQuery for getKeys, empty state, KeyListTable
- `frontend/src/pages/KeyDetailsPage.tsx` — Full page: status badge, action buttons (Edit/Rotate/Revoke/Delete with confirmation dialogs), KeyDetailsTabView with private key fetch support
- `frontend/src/pages/EditKeyMetadataPage.tsx` — Edit form (alias, description, expiration_date, snowflake_role), calls updateKey, redirects on success
- `frontend/src/pages/RotateKeyPage.tsx` — Guided rotation: shows old key info, pre-fills alternate slot, rotateKey API, shows cleanup SQL, prompts revoke old key

## Validation

- Key list does NOT show private key values (only KeySummary fields)
- Private key requires confirmation before reveal/copy/download (via SensitiveValueDisplay and CopyButton/DownloadButton requireConfirmation)
- Revoke and Delete both require confirmation dialogs (isDangerous=true → red button)
- Rotation pre-fills alternate key slot (RSA_PUBLIC_KEY ↔ RSA_PUBLIC_KEY_2)
- All 23 frontend tests pass (9 test files)
