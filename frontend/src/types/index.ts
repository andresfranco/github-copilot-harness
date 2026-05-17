export interface User {
  id: string
  email: string
  full_name?: string
  default_snowflake_account?: string
  default_environment?: string
  default_key_size?: number
  default_key_slot?: string
  default_encrypted?: boolean
  created_at: string
}

export interface KeySummary {
  id: string
  alias: string
  snowflake_account: string
  snowflake_username: string
  snowflake_role?: string
  environment: string
  key_slot: string
  key_size: number
  is_encrypted: boolean
  status: string
  expiration_date?: string
  created_at: string
  updated_at: string
}

export interface SnowflakeKey extends KeySummary {
  public_key_pem: string
  public_key_value: string
  snowflake_sql: string
  installation_instructions: string
  auth_examples: string
  description?: string
  last_viewed_at?: string
  last_downloaded_at?: string
}

export interface AuditLogEntry {
  id: string
  key_id: string
  user_id: string
  action: string
  ip_address?: string
  created_at: string
}

export interface DashboardStats {
  total_keys: number
  active_keys: number
  rotating_keys: number
  expired_keys: number
  revoked_keys: number
  expiring_soon: number
  recent_activity: AuditLogEntry[]
  recently_created: KeySummary[]
}

export interface KeyGenerationRequest {
  alias: string
  snowflake_account: string
  snowflake_username: string
  snowflake_role?: string
  environment: 'DEV' | 'TEST' | 'QA' | 'PROD' | 'SANDBOX' | 'OTHER'
  key_slot: 'RSA_PUBLIC_KEY' | 'RSA_PUBLIC_KEY_2'
  key_size: 2048 | 4096
  is_encrypted: boolean
  passphrase?: string
  confirm_passphrase?: string
  expiration_date?: string
  description?: string
}

export interface KeyGenerationResponse extends SnowflakeKey {
  private_key_pem?: string
}
