import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import GenerateKeyPage from '../GenerateKeyPage'

vi.mock('../../api/keys', () => ({
  generateKey: vi.fn(),
  getKeys: vi.fn(),
}))

function makeWrapper(): ({ children }: { children: ReactNode }) => JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('GenerateKeyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form', () => {
    render(<GenerateKeyPage />, { wrapper: makeWrapper() })
    expect(screen.getByRole('heading', { name: /generate key/i })).toBeInTheDocument()
  })

  it('form has alias, snowflake_account, snowflake_username fields', () => {
    render(<GenerateKeyPage />, { wrapper: makeWrapper() })
    expect(screen.getByLabelText(/^alias$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/snowflake account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/snowflake username/i)).toBeInTheDocument()
  })
})
