import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getKeys } from '../api/keys'
import type { KeyFilters } from '../api/keys'
import { KeyListTable } from '../components/KeyListTable'

const ENVIRONMENTS = ['', 'DEV', 'TEST', 'QA', 'PROD', 'SANDBOX', 'OTHER']
const STATUSES = ['', 'ACTIVE', 'ROTATING', 'EXPIRED', 'REVOKED']
const KEY_SLOTS = ['', 'RSA_PUBLIC_KEY', 'RSA_PUBLIC_KEY_2']

function KeyListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<KeyFilters>({})

  const {
    data: keys = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['keys', filters],
    queryFn: () => getKeys(filters),
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value || undefined }))
  }

  const handleFilterChange =
    (key: keyof KeyFilters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, [key]: e.target.value || undefined }))
    }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Keys</h1>
        <Link
          to="/keys/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Generate New Key
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by alias or username..."
          className="w-64 rounded border border-gray-300 px-3 py-2 text-sm"
          onChange={handleSearchChange}
        />
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          onChange={handleFilterChange('environment')}
        >
          {ENVIRONMENTS.map((env) => (
            <option key={env} value={env}>
              {env || 'All Environments'}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          onChange={handleFilterChange('status')}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status || 'All Statuses'}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-gray-300 px-3 py-2 text-sm"
          onChange={handleFilterChange('key_slot')}
        >
          {KEY_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot || 'All Key Slots'}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      )}

      {isError && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-700">
          Failed to load keys.
        </div>
      )}

      {!isLoading && !isError && keys.length === 0 && (
        <div className="flex h-32 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-200 text-gray-500">
          <p>No keys found.</p>
          <Link
            to="/keys/new"
            className="text-sm text-blue-600 hover:underline"
          >
            Generate your first key
          </Link>
        </div>
      )}

      {!isLoading && !isError && keys.length > 0 && (
        <KeyListTable
          keys={keys}
          onRowClick={(id) => navigate(`/keys/${id}`)}
        />
      )}
    </div>
  )
}

export default KeyListPage
