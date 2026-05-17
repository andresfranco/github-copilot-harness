import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getKey,
  getAuditHistory,
  getPrivateKey,
  revokeKey,
  deleteKey,
} from '../api/keys'
import { KeyDetailsTabView } from '../components/KeyDetailsTabView'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import { StatusBadge } from '../components/StatusBadge'

function KeyDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [privateKeyPem, setPrivateKeyPem] = useState<string | undefined>()
  const [isFetchingPrivateKey, setIsFetchingPrivateKey] = useState(false)

  const {
    data: keyData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['key', id],
    queryFn: () => getKey(id!),
    enabled: !!id,
  })

  const { data: auditHistory = [] } = useQuery({
    queryKey: ['key-audit', id],
    queryFn: () => getAuditHistory(id!),
    enabled: !!id,
  })

  const revokeMutation = useMutation({
    mutationFn: () => revokeKey(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteKey(id!),
    onSuccess: () => {
      navigate('/keys')
    },
  })

  const handleFetchPrivateKey = async () => {
    setIsFetchingPrivateKey(true)
    try {
      const result = await getPrivateKey(id!)
      setPrivateKeyPem(result.private_key_pem)
    } finally {
      setIsFetchingPrivateKey(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (isError || !keyData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Failed to load key details.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{keyData.alias}</h1>
          <StatusBadge status={keyData.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/keys/${id}/edit`}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </Link>
          <Link
            to={`/keys/${id}/rotate`}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Rotate
          </Link>
          <button
            type="button"
            onClick={() => setShowRevokeConfirm(true)}
            className="rounded border border-yellow-300 px-3 py-1.5 text-sm text-yellow-700 hover:bg-yellow-50"
          >
            Revoke
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <KeyDetailsTabView
          keyData={keyData}
          auditHistory={auditHistory}
          privateKeyPem={privateKeyPem}
          onFetchPrivateKey={handleFetchPrivateKey}
          isFetchingPrivateKey={isFetchingPrivateKey}
        />
      </div>

      <ConfirmationDialog
        isOpen={showRevokeConfirm}
        title="Revoke Key"
        message="Are you sure you want to revoke this key? This action cannot be undone."
        onConfirm={() => {
          setShowRevokeConfirm(false)
          revokeMutation.mutate()
        }}
        onCancel={() => setShowRevokeConfirm(false)}
        isDangerous
        confirmLabel="Revoke"
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Key"
        message="Are you sure you want to permanently delete this key? This action cannot be undone."
        onConfirm={() => {
          setShowDeleteConfirm(false)
          deleteMutation.mutate()
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        isDangerous
        confirmLabel="Delete"
      />
    </div>
  )
}

export default KeyDetailsPage
