import { useState } from 'react'
import type { SnowflakeKey, AuditLogEntry } from '../types'
import { SensitiveValueDisplay } from './SensitiveValueDisplay'
import { CopyButton } from './CopyButton'
import { DownloadButton } from './DownloadButton'
import { MarkdownRenderer } from './MarkdownRenderer'

const TABS = [
  'Overview',
  'Private Key',
  'Public Key',
  'Snowflake SQL Script',
  'Installation Instructions',
  'Authentication Examples',
  'Audit History',
] as const

type Tab = (typeof TABS)[number]

interface KeyDetailsTabViewProps {
  keyData: SnowflakeKey
  auditHistory: AuditLogEntry[]
  privateKeyPem?: string
  onFetchPrivateKey?: () => void
  isFetchingPrivateKey?: boolean
}

export function KeyDetailsTabView({
  keyData,
  auditHistory,
  privateKeyPem,
  onFetchPrivateKey,
  isFetchingPrivateKey = false,
}: KeyDetailsTabViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex flex-wrap border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === 'Overview' && (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-gray-500">Alias</dt>
              <dd className="mt-1 font-medium text-gray-900">{keyData.alias}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Snowflake Account</dt>
              <dd className="mt-1 text-gray-900">{keyData.snowflake_account}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Snowflake Username</dt>
              <dd className="mt-1 text-gray-900">{keyData.snowflake_username}</dd>
            </div>
            {keyData.snowflake_role && (
              <div>
                <dt className="text-xs font-medium text-gray-500">Snowflake Role</dt>
                <dd className="mt-1 text-gray-900">{keyData.snowflake_role}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-gray-500">Environment</dt>
              <dd className="mt-1 text-gray-900">{keyData.environment}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Key Slot</dt>
              <dd className="mt-1 text-gray-900">{keyData.key_slot}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Key Size</dt>
              <dd className="mt-1 text-gray-900">{keyData.key_size} bits</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Encrypted</dt>
              <dd className="mt-1 text-gray-900">{keyData.is_encrypted ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-gray-900">{keyData.status}</dd>
            </div>
            {keyData.expiration_date && (
              <div>
                <dt className="text-xs font-medium text-gray-500">Expiration Date</dt>
                <dd className="mt-1 text-gray-900">{keyData.expiration_date}</dd>
              </div>
            )}
            {keyData.description && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-gray-900">{keyData.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(keyData.created_at).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(keyData.updated_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        )}

        {activeTab === 'Private Key' && (
          <div className="space-y-3">
            {privateKeyPem ? (
              <>
                <SensitiveValueDisplay
                  value={privateKeyPem}
                  label="Private Key"
                />
                <div className="flex flex-wrap gap-2">
                  <CopyButton
                    value={privateKeyPem}
                    label="Copy Private Key"
                    requireConfirmation
                    confirmationMessage="Are you sure you want to copy the private key to clipboard?"
                  />
                  <DownloadButton
                    value={privateKeyPem}
                    filename={`${keyData.alias}.p8`}
                    mimeType="application/x-pkcs8"
                    label="Download .p8"
                    requireConfirmation
                    confirmationMessage="Are you sure you want to download the private key?"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  The private key is not stored on the server after generation. If you
                  need to retrieve it, click below.
                </p>
                {onFetchPrivateKey && (
                  <button
                    type="button"
                    onClick={onFetchPrivateKey}
                    disabled={isFetchingPrivateKey}
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isFetchingPrivateKey ? 'Fetching...' : 'Fetch Private Key'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'Public Key' && (
          <div className="space-y-3">
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
              {keyData.public_key_pem}
            </pre>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={keyData.public_key_pem} label="Copy Public Key" />
              <DownloadButton
                value={keyData.public_key_pem}
                filename={`${keyData.alias}.pub`}
                mimeType="text/plain"
                label="Download .pub"
              />
            </div>
          </div>
        )}

        {activeTab === 'Snowflake SQL Script' && (
          <div className="space-y-3">
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
              {keyData.snowflake_sql}
            </pre>
            <div className="flex flex-wrap gap-2">
              <CopyButton value={keyData.snowflake_sql} label="Copy SQL" />
              <DownloadButton
                value={keyData.snowflake_sql}
                filename={`${keyData.alias}_setup.sql`}
                mimeType="text/plain"
                label="Download .sql"
              />
            </div>
          </div>
        )}

        {activeTab === 'Installation Instructions' && (
          <div className="space-y-4">
            <MarkdownRenderer content={keyData.installation_instructions} />
            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              <CopyButton
                value={keyData.installation_instructions}
                label="Copy Instructions"
              />
              <DownloadButton
                value={keyData.installation_instructions}
                filename={`${keyData.alias}_instructions.txt`}
                mimeType="text/plain"
                label="Download .txt"
              />
            </div>
          </div>
        )}

        {activeTab === 'Authentication Examples' && (
          <div className="space-y-4">
            <MarkdownRenderer content={keyData.auth_examples} />
            <div className="border-t border-gray-100 pt-4">
              <CopyButton value={keyData.auth_examples} label="Copy Examples" />
            </div>
          </div>
        )}

        {activeTab === 'Audit History' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Action
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    IP Address
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No audit history
                    </td>
                  </tr>
                ) : (
                  auditHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100">
                      <td className="px-4 py-2">{entry.action}</td>
                      <td className="px-4 py-2 text-gray-500">
                        {entry.ip_address ?? '-'}
                      </td>
                      <td className="px-4 py-2 text-gray-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
