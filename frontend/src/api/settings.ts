import { apiClient } from './client'

export interface UserSettings {
  id: string
  email: string
  full_name?: string
  default_snowflake_account?: string
  default_environment?: string
  default_key_size?: number
  default_key_slot?: string
  default_encrypted?: boolean
}

export interface UserSettingsUpdate {
  full_name?: string
  default_snowflake_account?: string
  default_environment?: string
  default_key_size?: number
  default_key_slot?: string
  default_encrypted?: boolean
}

export async function getSettings(): Promise<UserSettings> {
  const response = await apiClient.get<UserSettings>('/settings')
  return response.data
}

export async function updateSettings(data: UserSettingsUpdate): Promise<UserSettings> {
  const response = await apiClient.put<UserSettings>('/settings', data)
  return response.data
}
