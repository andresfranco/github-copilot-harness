import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import KeyListPage from '../KeyListPage'
import { getKeys } from '../../api/keys'

vi.mock('../../api/keys', () => ({
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

describe('KeyListPage', () => {
  beforeEach(() => {
    vi.mocked(getKeys).mockResolvedValue([])
  })

  it('renders the key list page', async () => {
    render(<KeyListPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/my keys/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no keys', async () => {
    vi.mocked(getKeys).mockResolvedValue([])
    render(<KeyListPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/no keys found/i)).toBeInTheDocument()
    })
  })
})
