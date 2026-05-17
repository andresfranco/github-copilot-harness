import type { KeySummary } from '../types'
import { StatusBadge } from './StatusBadge'

interface KeyListTableProps {
  keys: KeySummary[]
  onRowClick: (id: string) => void
}

export function KeyListTable({ keys, onRowClick }: KeyListTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
              Alias
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
              Snowflake Username
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
              Environment
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
              Key Slot
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
              Size
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
              Created At
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr
              key={key.id}
              onClick={() => onRowClick(key.id)}
              className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
              role="row"
            >
              <td className="px-4 py-3 font-medium text-blue-600">{key.alias}</td>
              <td className="px-4 py-3 text-gray-700">{key.snowflake_username}</td>
              <td className="px-4 py-3 text-gray-700">{key.environment}</td>
              <td className="px-4 py-3 text-gray-700">{key.key_slot}</td>
              <td className="px-4 py-3 text-gray-700">{key.key_size}</td>
              <td className="px-4 py-3">
                <StatusBadge status={key.status} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(key.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
