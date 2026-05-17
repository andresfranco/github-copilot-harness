import { apiClient } from './client'
import type { DashboardStats } from '../types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>('/dashboard')
  return response.data
}
