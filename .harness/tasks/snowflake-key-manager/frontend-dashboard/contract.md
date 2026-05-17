# Contract: frontend-dashboard

## Task

Implement the Dashboard page with stats cards and recent activity.

## Worker

harness-worker-frontend

## Depends on

- frontend-auth

## Touches

- frontend/src/api/dashboard.ts
- frontend/src/pages/DashboardPage.tsx
- frontend/src/components/StatsCard.tsx
- frontend/src/components/RecentActivity.tsx

## Dashboard API (src/api/dashboard.ts)

- `getDashboardStats(): Promise<DashboardStats>`

## DashboardPage

Displays:
- Row of StatsCard components: Total Keys, Active, Rotating, Expired, Revoked, Expiring Soon.
- RecentActivity section with recent audit events.
- Recently Created Keys list (link to key details).
- Loading state while fetching.
- Empty state when no keys exist.

## StatsCard component

Props: `{ label: string, count: number, color?: string }`

## RecentActivity component

Props: `{ activities: AuditLogEntry[] }`
Renders list of recent audit events with human-readable descriptions.

## Correctness assertions covered

- Dashboard displays correct counts.
- Loading state shown while data fetches.

## Test files

- frontend/src/pages/__tests__/DashboardPage.test.tsx

## Definition of done

- Dashboard page renders with mocked data.
- Stats cards show correct values.
- Tests pass.
