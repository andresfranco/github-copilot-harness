const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ROTATING: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-yellow-100 text-yellow-800',
  REVOKED: 'bg-red-100 text-red-800',
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  )
}
