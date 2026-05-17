import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getDashboardStats } from '../api/dashboard'
import { StatsCard } from '../components/StatsCard'
import { RecentActivity } from '../components/RecentActivity'

function DashboardPage() {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Failed to load dashboard data.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard label="Total Keys" count={stats.total_keys} color="blue" />
        <StatsCard label="Active" count={stats.active_keys} color="green" />
        <StatsCard label="Rotating" count={stats.rotating_keys} color="yellow" />
        <StatsCard label="Expired" count={stats.expired_keys} color="gray" />
        <StatsCard label="Revoked" count={stats.revoked_keys} color="red" />
        <StatsCard
          label="Expiring Soon"
          count={stats.expiring_soon}
          color="orange"
        />
      </div>

      <RecentActivity activities={stats.recent_activity} />

      {stats.recently_created.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recently Created
          </h2>
          <ul className="divide-y divide-gray-100">
            {stats.recently_created.map((key) => (
              <li key={key.id} className="py-3">
                <Link
                  to={`/keys/${key.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {key.alias}
                </Link>
                <span className="ml-2 text-xs text-gray-400">
                  {key.environment} · {key.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default DashboardPage

