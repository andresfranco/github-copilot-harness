import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { KeyGenerationRequest } from '../types'

const ENVIRONMENTS = ['DEV', 'TEST', 'QA', 'PROD', 'SANDBOX', 'OTHER'] as const
const KEY_SLOTS = ['RSA_PUBLIC_KEY', 'RSA_PUBLIC_KEY_2'] as const

const schema = z
  .object({
    alias: z.string().min(1, 'Alias is required'),
    snowflake_account: z.string().min(1, 'Snowflake account is required'),
    snowflake_username: z.string().min(1, 'Snowflake username is required'),
    snowflake_role: z.string().optional(),
    environment: z.enum(ENVIRONMENTS, { required_error: 'Environment is required' }),
    key_slot: z.enum(KEY_SLOTS, { required_error: 'Key slot is required' }),
    key_size: z.preprocess(
      (v) => Number(v),
      z.union([z.literal(2048), z.literal(4096)]),
    ),
    is_encrypted: z.boolean(),
    passphrase: z.string().optional(),
    confirm_passphrase: z.string().optional(),
    expiration_date: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_encrypted) {
      if (!data.passphrase) {
        ctx.addIssue({
          code: 'custom',
          path: ['passphrase'],
          message: 'Passphrase is required when encryption is enabled',
        })
      } else {
        if (data.passphrase.length < 12) {
          ctx.addIssue({
            code: 'custom',
            path: ['passphrase'],
            message: 'Passphrase must be at least 12 characters',
          })
        }
        if (!/[A-Z]/.test(data.passphrase)) {
          ctx.addIssue({
            code: 'custom',
            path: ['passphrase'],
            message: 'Passphrase must contain uppercase letters',
          })
        }
        if (!/[a-z]/.test(data.passphrase)) {
          ctx.addIssue({
            code: 'custom',
            path: ['passphrase'],
            message: 'Passphrase must contain lowercase letters',
          })
        }
        if (!/[0-9]/.test(data.passphrase)) {
          ctx.addIssue({
            code: 'custom',
            path: ['passphrase'],
            message: 'Passphrase must contain numbers',
          })
        }
        if (!/[^A-Za-z0-9]/.test(data.passphrase)) {
          ctx.addIssue({
            code: 'custom',
            path: ['passphrase'],
            message: 'Passphrase must contain at least one special character',
          })
        }
      }
      if (!data.confirm_passphrase) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm_passphrase'],
          message: 'Please confirm your passphrase',
        })
      } else if (data.passphrase && data.confirm_passphrase !== data.passphrase) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm_passphrase'],
          message: 'Passphrases do not match',
        })
      }
    }
  })

type KeyFormData = z.infer<typeof schema>

interface KeyGenerationFormProps {
  onSubmit: (data: KeyGenerationRequest) => void
  isLoading?: boolean
  defaultValues?: Partial<KeyGenerationRequest>
}

export function KeyGenerationForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: KeyGenerationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<KeyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      key_size: 2048,
      is_encrypted: false,
      environment: 'DEV' as const,
      key_slot: 'RSA_PUBLIC_KEY' as const,
      ...defaultValues,
    },
  })

  const isEncrypted = watch('is_encrypted')

  const handleFormSubmit = (data: KeyFormData) => {
    onSubmit(data as unknown as KeyGenerationRequest)
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      aria-label="Key generation form"
    >
      {/* Alias */}
      <div className="mb-4">
        <label htmlFor="alias" className="mb-1 block text-sm font-medium text-gray-700">
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

      {/* Snowflake Account */}
      <div className="mb-4">
        <label
          htmlFor="snowflake_account"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Snowflake Account
        </label>
        <input
          id="snowflake_account"
          type="text"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('snowflake_account')}
        />
        {errors.snowflake_account && (
          <p className="mt-1 text-xs text-red-600">{errors.snowflake_account.message}</p>
        )}
      </div>

      {/* Snowflake Username */}
      <div className="mb-4">
        <label
          htmlFor="snowflake_username"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Snowflake Username
        </label>
        <input
          id="snowflake_username"
          type="text"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('snowflake_username')}
        />
        {errors.snowflake_username && (
          <p className="mt-1 text-xs text-red-600">{errors.snowflake_username.message}</p>
        )}
      </div>

      {/* Snowflake Role */}
      <div className="mb-4">
        <label
          htmlFor="snowflake_role"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Snowflake Role{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="snowflake_role"
          type="text"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('snowflake_role')}
        />
      </div>

      {/* Environment */}
      <div className="mb-4">
        <label
          htmlFor="environment"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Environment
        </label>
        <select
          id="environment"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('environment')}
        >
          {ENVIRONMENTS.map((env) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
        {errors.environment && (
          <p className="mt-1 text-xs text-red-600">{errors.environment.message}</p>
        )}
      </div>

      {/* Key Slot */}
      <div className="mb-4">
        <label
          htmlFor="key_slot"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Key Slot
        </label>
        <select
          id="key_slot"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('key_slot')}
        >
          {KEY_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        {errors.key_slot && (
          <p className="mt-1 text-xs text-red-600">{errors.key_slot.message}</p>
        )}
      </div>

      {/* Key Size */}
      <div className="mb-4">
        <span className="mb-2 block text-sm font-medium text-gray-700">Key Size</span>
        <div className="flex gap-4">
          {([2048, 4096] as const).map((size) => (
            <label key={size} className="inline-flex items-center gap-2">
              <input
                type="radio"
                value={size}
                className="h-4 w-4"
                {...register('key_size')}
              />
              <span className="text-sm">{size} bits</span>
            </label>
          ))}
        </div>
        {errors.key_size && (
          <p className="mt-1 text-xs text-red-600">{errors.key_size.message as string}</p>
        )}
      </div>

      {/* Encryption */}
      <div className="mb-4">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            id="is_encrypted"
            className="h-4 w-4"
            {...register('is_encrypted')}
          />
          <span className="text-sm font-medium text-gray-700">Encrypt private key</span>
        </label>
      </div>

      {/* Passphrase fields (shown only when encrypted) */}
      {isEncrypted && (
        <>
          <div className="mb-4">
            <label
              htmlFor="passphrase"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Passphrase
            </label>
            <input
              id="passphrase"
              type="password"
              autoComplete="new-password"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              {...register('passphrase')}
            />
            {errors.passphrase && (
              <p className="mt-1 text-xs text-red-600">{errors.passphrase.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirm_passphrase"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm Passphrase
            </label>
            <input
              id="confirm_passphrase"
              type="password"
              autoComplete="new-password"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              {...register('confirm_passphrase')}
            />
            {errors.confirm_passphrase && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirm_passphrase.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* Expiration Date */}
      <div className="mb-4">
        <label
          htmlFor="expiration_date"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Expiration Date{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="expiration_date"
          type="date"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('expiration_date')}
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Description{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('description')}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Key'}
      </button>
    </form>
  )
}
