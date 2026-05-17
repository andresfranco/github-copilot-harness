import { useState } from 'react'
import axios from 'axios'
import { KeyGenerationForm } from '../components/KeyGenerationForm'
import { KeyOutputsDisplay } from '../components/KeyOutputsDisplay'
import { generateKey } from '../api/keys'
import type { KeyGenerationRequest, KeyGenerationResponse } from '../types'

function GenerateKeyPage() {
  const [keyData, setKeyData] = useState<KeyGenerationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: KeyGenerationRequest) => {
    setError(null)
    setIsLoading(true)
    try {
      const result = await generateKey(data)
      setKeyData(result)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to generate key. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Generate Key</h1>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {keyData ? (
        <KeyOutputsDisplay keyData={keyData} />
      ) : (
        <div className="max-w-2xl">
          <KeyGenerationForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      )}
    </div>
  )
}

export default GenerateKeyPage
