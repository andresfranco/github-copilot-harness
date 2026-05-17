import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../useAuth'
import { useAuthStore } from '../../store/authStore'
import { getMe } from '../../api/auth'

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
}))

function wrapper({ children }: { children: ReactNode }) {
  return createElement(MemoryRouter, {}, children)
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null, user: null })
    vi.mocked(getMe).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    })
  })

  it('isAuthenticated is false when no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is true when token exists', () => {
    // Prevent getMe from resolving to avoid act() warnings from async state updates
    vi.mocked(getMe).mockImplementationOnce(() => new Promise(() => {}))
    useAuthStore.setState({ token: 'test-token', user: null })
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(true)
  })
})

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null, user: null })
  })

  it('isAuthenticated is false when no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is true when token exists', () => {
    useAuthStore.setState({ token: 'test-token', user: null })
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAuthenticated).toBe(true)
  })
})
