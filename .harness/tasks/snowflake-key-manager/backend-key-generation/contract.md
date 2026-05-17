# Contract: backend-key-generation

## Task

Implement the `KeyGenerationService` that generates RSA key pairs and all derived outputs.

## Worker

harness-worker-backend

## Depends on

- db-models

## Touches

- backend/app/services/key_generation_service.py
- backend/app/schemas/key.py

## Service Interface

```python
class KeyGenerationService:
    def generate_key_pair(self, request: KeyGenerationRequest) -> KeyGenerationResult:
        """
        Generates RSA key pair and all associated outputs.
        Returns KeyGenerationResult with all fields populated.
        Does NOT persist to database.
        """

class KeyGenerationRequest:
    alias: str
    snowflake_account: str
    snowflake_username: str
    snowflake_role: Optional[str]
    environment: Environment
    key_slot: KeySlot
    key_size: Literal[2048, 4096]
    is_encrypted: bool
    passphrase: Optional[str]  # required if is_encrypted
    expiration_date: Optional[date]
    description: Optional[str]

class KeyGenerationResult:
    private_key_pem: str        # PEM format
    public_key_pem: str         # PEM format  
    public_key_value: str       # Stripped for Snowflake SQL
    snowflake_sql: str          # ALTER USER ... SET RSA_PUBLIC_KEY...
    installation_instructions: str
    auth_examples: str
```

## Key generation rules

- Use `cryptography` library (`rsa.generate_private_key`).
- Private key size: 2048 or 4096 bits.
- If `is_encrypted=True`, serialize with BestAvailableEncryption(passphrase).
- If `is_encrypted=False`, serialize with NoEncryption().
- Public key value = base64-encoded DER of public key (no PEM headers/footers/newlines).
- SQL for RSA_PUBLIC_KEY: `ALTER USER {username} SET RSA_PUBLIC_KEY = '{value}';`
- SQL for RSA_PUBLIC_KEY_2: `ALTER USER {username} SET RSA_PUBLIC_KEY_2 = '{value}';`

## Installation instructions template

Must include:
- Step 1: Download and store private key. Filename: `snowflake_{env}_{username}_{alias}.p8`
- Step 2: chmod 600 (macOS/Linux) + Windows PowerShell icacls equivalent
- Step 3: Run the SQL script in Snowflake
- Step 4: Test authentication
- Step 5: Store in secret manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault, GitHub Actions Secrets, Anypoint Secrets Manager)

## Auth examples template

Must include:
- Python snowflake-connector-python example with placeholders
- SnowSQL CLI example
- Generic environment variable example

## Validation rules (raise ValueError)

- `passphrase` required if `is_encrypted=True`
- `key_size` must be 2048 or 4096
- Passphrase strength: min 12 chars, must contain uppercase, lowercase, digit, and special character

## Correctness assertions covered

- 9: 2048-bit key generation works
- 10: 4096-bit key generation works
- 11: Unencrypted private key starts with `-----BEGIN PRIVATE KEY-----`
- 12: Encrypted private key starts with `-----BEGIN ENCRYPTED PRIVATE KEY-----`
- 13: Public key starts with `-----BEGIN PUBLIC KEY-----`
- 14: Public key value has no PEM headers/footers/spaces/line breaks
- 15: SQL for RSA_PUBLIC_KEY contains `SET RSA_PUBLIC_KEY`
- 16: SQL for RSA_PUBLIC_KEY_2 contains `SET RSA_PUBLIC_KEY_2`
- 19: Invalid key size raises error
- 20: Encrypted key with no passphrase raises error
- 22: Weak passphrase raises error

## Test files

- backend/tests/unit/test_key_generation_service.py

## Definition of done

- Service generates valid RSA key pairs for both sizes.
- All output fields populated correctly.
- All validation rules enforced.
- All unit tests pass.
