import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getKey, rotateKey, revokeKey } from '../api/keys'
import { KeyGenerationForm } from '../components/KeyGenerationForm'
import { KeyOutputsDisplay } from '../components/KeyOutputsDisplay'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import { CopyButton } from '../components/CopyButton'
import { DownloadButton } from '../components/DownloadButton'
import type { KeyGenerationRequest, KeyGenerationResponse } from '../types'

type NewKeyState = KeyGenerationResponse & { cleanup_sql?: string }

function RotateKeyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [newKeyData, setNewKeyData] = useState<NewKeyState | null>(null)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)

  const { data: keyData, isLoading } = useQuery({
    queryKey: ['key', id],
    queryFn: () => getKey(id!),
    enabled: !!id,
  })

  const rotateMutation = useMutation({
    mutationFn: (data: KeyGenerationRequest) => rotateKey(id!, data),
    onSuccess: (result) => {
      setNewKeyData({ ...result.new_key, cleanup_sql: result.cleanup_sql })
    },
  })

  const revokeMutation = useMutation({
    mutationFn: () => revokeKey(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key', id] })
      navigate(`/keys/${id}`)
    },
  })

  const getAlternateSlot = (slot: string): string => {
    return slot === 'RSA_PUBLIC_KEY' ? 'RSA_PUBLIC_KEY_2' : 'RSA_PUBLIC_KEY'
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!keyData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Key not found.</p>
      </div>
    )
  }

  const alternateSlot = getAlternateSlot(keyData.key_slot)

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Rotate Key</h1>

      {/* Current key info */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 font-semibold text-gray-700">Current Key</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-xs text-gray-500">Alias</dt>
            <dd>{keyData.alias}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Key Slot</dt>
            <dd>{keyData.key_slot}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Environment</dt>
            <dd>{keyData.environment}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Status</dt>
            <dd>{keyData.status}</dd>
          </div>
        </dl>
        <p className="mt-2 text-sm text-gray-600">
          New key will use alternate slot:{' '}
          <strong>{alternateSlot}</strong>
        </p>
      </div>

      {rotateMutation.isError && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          Failed to rotate key. Please try again.
        </div>
      )}

      {newKeyData ? (
        <div className="space-y-6">
          <KeyOutputsDisplay keyData={newKeyData} />

          {newKeyData.cleanup_sql && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <h3 className="mb-2 font-semibold text-orange-800">Cleanup SQL</h3>
              <p className="mb-2 text-sm text-orange-700">
                Run this SQL after the new key is working to clean up:
              </p>
              <pre className="mb-3 overflow-auto rounded bg-white p-3 text-xs">
                {newKeyData.cleanup_sql}
              </pre>
              <div className="flex gap-2">
                <CopyButton value={newKeyData.cleanup_sql} label="Copy SQL" />
                <DownloadButton
                  value={newKeyData.cleanup_sql}
                  filename={`${keyData.alias}_cleanup.sql`}
                  mimeType="text/plain"
                  label="Download .sql"
                />
              </div>
            </div>
          )}

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              After verifying the new key works correctly, revoke the old key.
            </p>
            <button
              type="button"
              onClick={() => setShowRevokeConfirm(true)}
              className="mt-3 rounded bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Revoke Old Key
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl">
          <h2 className="mb-4 font-semibold text-gray-800">
            New Key Configuration
          </h2>
          <KeyGenerationForm
            onSubmit={(data) => rotateMutation.mutate(data)}
            isLoading={rotateMutation.isPending}
            defaultValues={{
              alias: keyData.alias,
              snowflake_account: keyData.snowflake_account,
              snowflake_username: keyData.snowflake_username,
              snowflake_role: keyData.snowflake_role,
              environment: keyData.environment as 'DEV' | 'TEST' | 'QA' | 'PROD' | 'SANDBOX' | 'OTHER',
              key_slot: alternateSlot as 'RSA_PUBLIC_KEY' | 'RSA_PUBLIC_KEY_2',
              key_size: keyData.key_size as 2048 | 4096,
              is_encrypted: keyData.is_encrypted,
            }}
          />
        </div>
      )}

      <ConfirmationDialog
        isOpen={showRevokeConfirm}
        title="Revoke Old Key"
        message="Are you sure you want to revoke the old key? Ensure the new key is working before proceeding."
        onConfirm={() => {
          setShowRevokeConfirm(false)
          revokeMutation.mutate()
        }}
        onCancel={() => setShowRevokeConfirm(false)}
        isDangerous
        confirmLabel="Revoke Old Key"
      />
    </div>
  )
}

export default RotateKeyPage
