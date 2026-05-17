import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getSettings, updateSettings } from '../api/settings'
import type { UserSettingsUpdate } from '../api/settings'

const schema = z.object({
  full_name: z.string().optional(),
  default_snowflake_account: z.string().optional(),
  default_environment: z.string().optional(),
  default_key_size: z.coerce.number().optional(),
  default_key_slot: z.string().optional(),
  default_encrypted: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

function SettingsPage() {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: settings
      ? {
          full_name: settings.full_name ?? '',
          default_snowflake_account: settings.default_snowflake_account ?? '',
          default_environment: settings.default_environment ?? '',
          default_key_size: settings.default_key_size ?? 2048,
          default_key_slot: settings.default_key_slot ?? '',
          default_encrypted: settings.default_encrypted ?? false,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: UserSettingsUpdate) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setSuccessMessage('Settings saved successfully.')
      setTimeout(() => setSuccessMessage(null), 3000)
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      {successMessage && (
        <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {mutation.isError && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          Failed to save settings. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Profile section */}
        <section aria-labelledby="profile-heading" className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 id="profile-heading" className="mb-4 text-lg font-semibold text-gray-900">
            Profile
          </h2>

          <div className="mb-4">
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              readOnly
              value={settings?.email ?? ''}
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
        </section>

        {/* Snowflake Defaults section */}
        <section aria-labelledby="defaults-heading" className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
          <h2 id="defaults-heading" className="mb-4 text-lg font-semibold text-gray-900">
            Snowflake Defaults
          </h2>

          <div className="mb-4">
            <label htmlFor="default_snowflake_account" className="mb-1 block text-sm font-medium text-gray-700">
              Default Snowflake Account
            </label>
            <input
              id="default_snowflake_account"
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              {...register('default_snowflake_account')}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="default_environment" className="mb-1 block text-sm font-medium text-gray-700">
              Default Environment
            </label>
            <select
              id="default_environment"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              {...register('default_environment')}
            >
              <option value="">-- Select --</option>
              <option value="DEV">DEV</option>
              <option value="TEST">TEST</option>
              <option value="QA">QA</option>
              <option value="PROD">PROD</option>
              <option value="SANDBOX">SANDBOX</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div className="mb-4">
            <fieldset>
              <legend className="mb-1 text-sm font-medium text-gray-700">Default Key Size</legend>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={2048}
                    {...register('default_key_size')}
                  />
                  2048
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={4096}
                    {...register('default_key_size')}
                  />
                  4096
                </label>
              </div>
            </fieldset>
          </div>

          <div className="mb-4">
            <label htmlFor="default_key_slot" className="mb-1 block text-sm font-medium text-gray-700">
              Default Key Slot
            </label>
            <select
              id="default_key_slot"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              {...register('default_key_slot')}
            >
              <option value="">-- Select --</option>
              <option value="RSA_PUBLIC_KEY">RSA_PUBLIC_KEY</option>
              <option value="RSA_PUBLIC_KEY_2">RSA_PUBLIC_KEY_2</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                id="default_encrypted"
                {...register('default_encrypted')}
              />
              Encrypt private key by default
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

export default SettingsPage
