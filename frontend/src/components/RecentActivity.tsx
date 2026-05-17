import type { AuditLogEntry } from '../types'

interface RecentActivityProps {
  activities: AuditLogEntry[]
}

const actionLabels: Record<string, string> = {
  generate: 'Generated key',
  view: 'Viewed key',
  download: 'Downloaded key',
  rotate: 'Rotated key',
  revoke: 'Revoked key',
  delete: 'Deleted key',
  update: 'Updated key metadata',
}

function formatAction(action: string): string {
  return actionLabels[action] ?? action
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>
        <p className="text-sm text-gray-500">No recent activity.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Activity
      </h2>
      <ul className="divide-y divide-gray-100">
        {activities.map((entry) => (
          <li key={entry.id} className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {formatAction(entry.action)}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(entry.created_at)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
