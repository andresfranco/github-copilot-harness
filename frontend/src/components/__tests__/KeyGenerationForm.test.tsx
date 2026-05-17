import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { KeyGenerationForm } from '../../components/KeyGenerationForm'
import type { KeyGenerationRequest } from '../../types'

const mockOnSubmit = vi.fn()

function renderForm(
  props?: Partial<{
    onSubmit: (data: KeyGenerationRequest) => void
    isLoading: boolean
    defaultValues: Partial<KeyGenerationRequest>
  }>,
) {
  return render(
    <KeyGenerationForm
      onSubmit={mockOnSubmit}
      isLoading={false}
      {...props}
    />,
  )
}

describe('KeyGenerationForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockReset()
  })

  it('renders all required fields', () => {
    renderForm()
    expect(screen.getByLabelText(/^alias$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/snowflake account/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/snowflake username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^environment$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^key slot$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate key/i })).toBeInTheDocument()
  })

  it('shows validation error when alias is empty and form is submitted', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /generate key/i }))
    await waitFor(() => {
      expect(screen.getByText(/alias is required/i)).toBeInTheDocument()
    })
  })

  it('passphrase field appears when is_encrypted is checked', async () => {
    renderForm()
    expect(screen.queryByLabelText(/^passphrase$/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: /encrypt private key/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/^passphrase$/i)).toBeInTheDocument()
    })
  })
})
