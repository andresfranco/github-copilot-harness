import type { KeyGenerationResponse } from '../types'
import { SensitiveValueDisplay } from './SensitiveValueDisplay'
import { CopyButton } from './CopyButton'
import { DownloadButton } from './DownloadButton'
import { MarkdownRenderer } from './MarkdownRenderer'

interface KeyOutputsDisplayProps {
  keyData: KeyGenerationResponse
}

export function KeyOutputsDisplay({ keyData }: KeyOutputsDisplayProps) {
  const alias = keyData.alias

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h2 className="text-lg font-semibold text-green-800">
          Key Generated Successfully
        </h2>
        <p className="mt-1 text-sm text-green-700">
          Alias: <strong>{alias}</strong>
        </p>
      </div>

      {/* Private Key */}
      {keyData.private_key_pem && (
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 font-semibold text-gray-800">Private Key</h3>
          <SensitiveValueDisplay
            value={keyData.private_key_pem}
            label="Private Key"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton
              value={keyData.private_key_pem}
              label="Copy Private Key"
              requireConfirmation
              confirmationMessage="Are you sure you want to copy the private key to clipboard? Ensure your clipboard is secure."
            />
            <DownloadButton
              value={keyData.private_key_pem}
              filename={`${alias}.p8`}
              mimeType="application/x-pkcs8"
              label="Download .p8"
              requireConfirmation
              confirmationMessage="Are you sure you want to download the private key? Store it securely."
            />
          </div>
        </section>
      )}

      {/* Public Key */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-gray-800">Public Key</h3>
        <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
          {keyData.public_key_pem}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton value={keyData.public_key_pem} label="Copy Public Key" />
          <DownloadButton
            value={keyData.public_key_pem}
            filename={`${alias}.pub`}
            mimeType="text/plain"
            label="Download .pub"
          />
        </div>
      </section>

      {/* Snowflake Public Key Value */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-gray-800">
          Snowflake Public Key Value
        </h3>
        <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
          {keyData.public_key_value}
        </pre>
        <div className="mt-3">
          <CopyButton value={keyData.public_key_value} label="Copy Value" />
        </div>
      </section>

      {/* Snowflake SQL Script */}
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-gray-800">Snowflake SQL Script</h3>
        <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
          {keyData.snowflake_sql}
        </pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton value={keyData.snowflake_sql} label="Copy SQL" />
          <DownloadButton
            value={keyData.snowflake_sql}
            filename={`${alias}_setup.sql`}
            mimeType="text/plain"
            label="Download .sql"
          />
        </div>
      </section>

      {/* Installation Instructions */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-gray-800">
          Installation Instructions
        </h3>
        <MarkdownRenderer content={keyData.installation_instructions} />
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
          <CopyButton
            value={keyData.installation_instructions}
            label="Copy Instructions"
          />
          <DownloadButton
            value={keyData.installation_instructions}
            filename={`${alias}_instructions.txt`}
            mimeType="text/plain"
            label="Download .txt"
          />
        </div>
      </section>

      {/* Authentication Examples */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-gray-800">
          Authentication Examples
        </h3>
        <MarkdownRenderer content={keyData.auth_examples} />
        <div className="mt-4 border-t border-gray-100 pt-4">
          <CopyButton value={keyData.auth_examples} label="Copy Examples" />
        </div>
      </section>
    </div>
  )
}
