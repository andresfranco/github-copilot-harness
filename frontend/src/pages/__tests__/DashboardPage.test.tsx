import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import DashboardPage from '../DashboardPage'
import type { DashboardStats } from '../../types'
import { getDashboardStats } from '../../api/dashboard'

const mockStats: DashboardStats = {
  total_keys: 5,
  active_keys: 3,
  rotating_keys: 1,
  expired_keys: 0,
  revoked_keys: 1,
  expiring_soon: 2,
  recent_activity: [],
  recently_created: [],
}

vi.mock('../../api/dashboard', () => ({
  getDashboardStats: vi.fn(),
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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(getDashboardStats).mockResolvedValue(mockStats)
  })

  it('shows loading state initially', () => {
    vi.mocked(getDashboardStats).mockImplementationOnce(
      () => new Promise(() => {}),
    )
    render(<DashboardPage />, { wrapper: makeWrapper() })
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders stats cards when data is loaded', async () => {
    render(<DashboardPage />, { wrapper: makeWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Total Keys')).toBeInTheDocument()
    })
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
