import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import SettingsPage from '../SettingsPage'
import type { UserSettings } from '../../api/settings'
import { getSettings } from '../../api/settings'

const mockSettings: UserSettings = {
  id: 'user-1',
  email: 'alice@example.com',
  full_name: 'Alice Example',
  default_snowflake_account: 'myaccount',
  default_environment: 'DEV',
  default_key_size: 2048,
  default_key_slot: 'RSA_PUBLIC_KEY',
  default_encrypted: false,
}

vi.mock('../../api/settings', () => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
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

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.mocked(getSettings).mockResolvedValue(mockSettings)
  })

  it('renders profile section', async () => {
    render(<SettingsPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })
  })

  it('renders defaults section', async () => {
    render(<SettingsPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByText('Snowflake Defaults')).toBeInTheDocument()
    })
  })

  it('shows full_name field', async () => {
    render(<SettingsPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })
  })

  it('shows default_environment select', async () => {
    render(<SettingsPage />, { wrapper: makeWrapper() })
    await waitFor(() => {
      expect(screen.getByLabelText(/default environment/i)).toBeInTheDocument()
    })
  })
})
