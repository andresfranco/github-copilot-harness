import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from '../RegisterPage'

const mockRegister = vi.fn()

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    register: mockRegister,
    isAuthenticated: false,
    user: null,
  }),
}))

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset()
  })

  it('renders email and password fields', () => {
    renderRegisterPage()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderRegisterPage()
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()
  })

  it('shows validation error when passwords do not match', async () => {
    renderRegisterPage()

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/passwords do not match/i),
      ).toBeInTheDocument()
    })
  })
})
