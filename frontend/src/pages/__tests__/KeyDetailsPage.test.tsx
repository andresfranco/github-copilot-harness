import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import type { ReactNode } from 'react'
import KeyDetailsPage from '../KeyDetailsPage'
import { getKey, getAuditHistory } from '../../api/keys'
import type { SnowflakeKey } from '../../types'

vi.mock('../../api/keys', () => ({
  getKey: vi.fn(),
  getAuditHistory: vi.fn(),
  revokeKey: vi.fn(),
  deleteKey: vi.fn(),
  getPrivateKey: vi.fn(),
}))

const mockKey: SnowflakeKey = {
  id: 'test-id',
  alias: 'my-test-key',
  snowflake_account: 'account.us-east-1',
  snowflake_username: 'testuser',
  snowflake_role: 'ACCOUNTADMIN',
  environment: 'DEV',
  key_slot: 'RSA_PUBLIC_KEY',
  key_size: 2048,
  is_encrypted: false,
  status: 'ACTIVE',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  public_key_pem: '-----BEGIN PUBLIC KEY-----\nMIIBIjAN\n-----END PUBLIC KEY-----',
  public_key_value: 'MIIBI...',
  snowflake_sql: "ALTER USER testuser SET RSA_PUBLIC_KEY='MIIBI...'",
  installation_instructions: 'Step 1: Copy the public key.',
  auth_examples: 'import snowflake.connector\n...',
  description: 'Test key description',
}

function makeWrapper(): ({ children }: { children: ReactNode }) => JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/keys/test-id']}>
          <Routes>
            <Route path="/keys/:id" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('KeyDetailsPage', () => {
  beforeEach(() => {
    vi.mocked(getKey).mockResolvedValue(mockKey)
    vi.mocked(getAuditHistory).mockResolvedValue([])
  })

  it('renders tabs', async () => {
    render(<KeyDetailsPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^overview$/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /^private key$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^public key$/i })).toBeInTheDocument()
  })

  it('renders overview tab content', async () => {
    render(<KeyDetailsPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'my-test-key' })).toBeInTheDocument()
    })
  })
})
