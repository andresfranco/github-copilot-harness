import { apiClient } from './client'
import type { User } from '../types'

export async function register(data: {
  email: string
  password: string
  full_name?: string
}): Promise<User> {
  const response = await apiClient.post<User>('/auth/register', data)
  return response.data
}

export async function login(
  email: string,
  password: string,
): Promise<{ access_token: string }> {
  const params = new URLSearchParams()
  params.append('username', email)
  params.append('password', password)
  const response = await apiClient.post<{ access_token: string }>(
    '/auth/login',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  )
  return response.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me')
  return response.data
}
