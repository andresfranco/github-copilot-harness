from __future__ import annotations

import base64
import re

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from app.schemas.key import KeyGenerationRequest, KeyGenerationResult

# Re-export so callers can import KeyGenerationRequest from this module.
__all__ = ["KeyGenerationService", "KeyGenerationRequest"]

_VALID_KEY_SIZES = (2048, 4096)


def _validate_passphrase_strength(passphrase: str) -> None:
    if len(passphrase) < 12:
        raise ValueError("Passphrase must be at least 12 characters long.")
    if not re.search(r"[A-Z]", passphrase):
        raise ValueError("Passphrase must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", passphrase):
        raise ValueError("Passphrase must contain at least one lowercase letter.")
    if not re.search(r"\d", passphrase):
        raise ValueError("Passphrase must contain at least one digit.")
    if not re.search(r"[^A-Za-z0-9]", passphrase):
        raise ValueError("Passphrase must contain at least one special character.")


def _build_snowflake_sql(request: KeyGenerationRequest, public_key_value: str) -> str:
    return (
        f"ALTER USER {request.snowflake_username} "
        f"SET {request.key_slot} = '{public_key_value}';"
    )


def _build_installation_instructions(request: KeyGenerationRequest) -> str:
    env = request.environment
    username = request.snowflake_username
    alias = request.alias
    filename = f"snowflake_{env}_{username}_{alias}.p8"

    return "\n".join([
        "# Snowflake Key Installation Instructions",
        "",
        "## Step 1: Store the Private Key File",
        "",
        f"Save the private key content to a file named `{filename}` and store it in a secure directory (e.g., `~/.ssh/` or a dedicated secrets folder).",
        "",
        "## Step 2: Set File Permissions",
        "",
        "**macOS / Linux:**",
        "",
        f"```bash\nchmod 600 {filename}\n```",
        "",
        "**Windows PowerShell:**",
        "",
        f'```powershell\nicacls "{filename}" /inheritance:r /grant:r "$($env:USERNAME):(R,W)"\n```',
        "",
        "## Step 3: Run the SQL Script in Snowflake",
        "",
        "Log in to your Snowflake account and execute the generated SQL script from the **Snowflake SQL Script** tab.",
        "",
        "## Step 4: Test Authentication",
        "",
        "Verify key-pair authentication works using the examples in the **Authentication Examples** tab.",
        "",
        "## Step 5: Store in a Secret Manager",
        "",
        "Protect the private key by storing it in a secure vault:",
        "",
        f"- **AWS Secrets Manager:** `aws secretsmanager create-secret --name {filename} --secret-string file://{filename}`",
        f"- **Azure Key Vault:** `az keyvault secret set --vault-name <vault> --name {alias} --file {filename}`",
        f"- **HashiCorp Vault:** `vault kv put secret/{alias} private_key=@{filename}`",
        "- **GitHub Actions Secrets:** Add as a repository secret in *Settings → Secrets and variables*",
        "- **Anypoint Secrets Manager:** Use MuleSoft Anypoint Platform Secrets Manager",
    ])


def _build_auth_examples(request: KeyGenerationRequest) -> str:
    account = request.snowflake_account
    username = request.snowflake_username
    role = request.snowflake_role or "<YOUR_ROLE>"
    env = request.environment
    alias = request.alias
    filename = f"snowflake_{env}_{username}_{alias}.p8"

    python_code = (
        "import snowflake.connector\n"
        "\n"
        "conn = snowflake.connector.connect(\n"
        f'    account="{account}",\n'
        f'    user="{username}",\n'
        f'    role="{role}",\n'
        f'    private_key_file="{filename}",\n'
        "    # private_key_file_pwd=\"<passphrase>\",  # Uncomment if key is encrypted\n"
        ")\n"
        "cursor = conn.cursor()\n"
        'cursor.execute("SELECT CURRENT_USER(), CURRENT_ROLE()")\n'
        "print(cursor.fetchone())\n"
        "conn.close()"
    )

    snowsql_code = (
        "snowsql \\\n"
        f"    --accountname {account} \\\n"
        f"    --username {username} \\\n"
        f"    --private-key-path {filename}"
    )

    env_var_code = (
        f'export SNOWFLAKE_ACCOUNT="{account}"\n'
        f'export SNOWFLAKE_USER="{username}"\n'
        f'export SNOWFLAKE_PRIVATE_KEY_PATH="{filename}"\n'
        "# export SNOWFLAKE_PRIVATE_KEY_PASSPHRASE=\"<passphrase>\"  # If encrypted"
    )

    sections = [
        "## Python — snowflake-connector-python\n\n"
        f"```python\n{python_code}\n```",

        "## SnowSQL CLI\n\n"
        f"```bash\n{snowsql_code}\n```",

        "## Environment Variables\n\n"
        f"```bash\n{env_var_code}\n```",
    ]

    return "\n\n".join(sections)


class KeyGenerationService:
    def generate_key_pair(self, request: KeyGenerationRequest) -> KeyGenerationResult:
        if request.key_size not in _VALID_KEY_SIZES:
            raise ValueError(
                f"key_size must be 2048 or 4096, got {request.key_size}."
            )
        if request.is_encrypted:
            if request.passphrase is None:
                raise ValueError("passphrase is required when is_encrypted=True.")
            _validate_passphrase_strength(request.passphrase)

        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=request.key_size,
        )

        encryption_algorithm: serialization.KeySerializationEncryption
        if request.is_encrypted:
            encryption_algorithm = serialization.BestAvailableEncryption(
                request.passphrase.encode("utf-8")  # type: ignore[union-attr]
            )
        else:
            encryption_algorithm = serialization.NoEncryption()

        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=encryption_algorithm,
        ).decode("utf-8")

        public_key = private_key.public_key()
        public_key_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("utf-8")

        der_bytes = public_key.public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        public_key_value = base64.b64encode(der_bytes).decode("utf-8")

        return KeyGenerationResult(
            private_key_pem=private_key_pem,
            public_key_pem=public_key_pem,
            public_key_value=public_key_value,
            snowflake_sql=_build_snowflake_sql(request, public_key_value),
            installation_instructions=_build_installation_instructions(request),
            auth_examples=_build_auth_examples(request),
        )
