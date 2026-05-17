import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getKey, updateKey } from '../api/keys'
import type { KeyUpdateRequest } from '../api/keys'

const schema = z.object({
  alias: z.string().min(1, 'Alias is required'),
  description: z.string().optional(),
  expiration_date: z.string().optional(),
  snowflake_role: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function EditKeyMetadataPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data: keyData, isLoading } = useQuery({
    queryKey: ['key', id],
    queryFn: () => getKey(id!),
    enabled: !!id,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: keyData
      ? {
          alias: keyData.alias,
          description: keyData.description ?? '',
          expiration_date: keyData.expiration_date ?? '',
          snowflake_role: keyData.snowflake_role ?? '',
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: KeyUpdateRequest) => updateKey(id!, data),
    onSuccess: () => {
      setSuccessMessage('Key updated successfully.')
      setTimeout(() => navigate(`/keys/${id}`), 1500)
    },
  })

  const onSubmit = (data: FormData) => {
    const update: KeyUpdateRequest = {
      alias: data.alias,
      description: data.description || undefined,
      expiration_date: data.expiration_date || undefined,
      snowflake_role: data.snowflake_role || undefined,
    }
    mutation.mutate(update)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Key Metadata</h1>

      {successMessage && (
        <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {mutation.isError && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          Failed to update key.
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg space-y-4"
        noValidate
      >
        <div>
          <label
            htmlFor="alias"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Alias
          </label>
          <input
            id="alias"
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('alias')}
          />
          {errors.alias && (
            <p className="mt-1 text-xs text-red-600">{errors.alias.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="snowflake_role"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Snowflake Role
          </label>
          <input
            id="snowflake_role"
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('snowflake_role')}
          />
        </div>

        <div>
          <label
            htmlFor="expiration_date"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Expiration Date
          </label>
          <input
            id="expiration_date"
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('expiration_date')}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('description')}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/keys/${id}`)}
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditKeyMetadataPage
