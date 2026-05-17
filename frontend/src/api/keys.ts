import { apiClient } from './client'
import type { SnowflakeKey, KeySummary, AuditLogEntry, KeyGenerationRequest, KeyGenerationResponse } from '../types'

export interface KeyFilters {
  environment?: string
  status?: string
  snowflake_username?: string
  key_slot?: string
  search?: string
}

export interface KeyUpdateRequest {
  alias?: string
  description?: string
  expiration_date?: string
  snowflake_role?: string
}

export interface RotateKeyResponse {
  new_key: KeyGenerationResponse
  cleanup_sql: string
}

export async function generateKey(data: KeyGenerationRequest): Promise<KeyGenerationResponse> {
  const response = await apiClient.post<KeyGenerationResponse>('/keys', data)
  return response.data
}

export async function getKeys(filters?: KeyFilters): Promise<KeySummary[]> {
  const response = await apiClient.get<KeySummary[]>('/keys', { params: filters })
  return response.data
}

export async function getKey(id: string): Promise<SnowflakeKey> {
  const response = await apiClient.get<SnowflakeKey>(`/keys/${id}`)
  return response.data
}

export async function getPrivateKey(id: string): Promise<{ private_key_pem: string }> {
  const response = await apiClient.get<{ private_key_pem: string }>(`/keys/${id}/private`)
  return response.data
}

export async function updateKey(id: string, data: KeyUpdateRequest): Promise<SnowflakeKey> {
  const response = await apiClient.patch<SnowflakeKey>(`/keys/${id}`, data)
  return response.data
}

export async function revokeKey(id: string): Promise<SnowflakeKey> {
  const response = await apiClient.post<SnowflakeKey>(`/keys/${id}/revoke`)
  return response.data
}

export async function deleteKey(id: string): Promise<void> {
  await apiClient.delete(`/keys/${id}`)
}

export async function rotateKey(id: string, data: KeyGenerationRequest): Promise<RotateKeyResponse> {
  const response = await apiClient.post<RotateKeyResponse>(`/keys/${id}/rotate`, data)
  return response.data
}

export async function getAuditHistory(id: string): Promise<AuditLogEntry[]> {
  const response = await apiClient.get<AuditLogEntry[]>(`/keys/${id}/audit`)
  return response.data
}
