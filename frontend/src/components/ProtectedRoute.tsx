import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/keys', label: 'My Keys' },
  { to: '/keys/new', label: '+ Generate Key' },
  { to: '/settings', label: 'Settings' },
]

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const { logout } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen">
      <nav className="w-56 shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="px-5 py-4 text-lg font-bold border-b border-gray-700">
          🔑 Key Manager
        </div>
        <ul className="flex-1 py-4 space-y-1">
          {navItems.map(({ to, label }) => {
            const active = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to)
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`block px-5 py-2 text-sm rounded mx-2 ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full text-left text-sm text-gray-400 hover:text-white px-2 py-1"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default ProtectedRoute
