# RED: This test file is intentionally failing (imports non-existent modules)
import pytest

from app.services.key_generation_service import (  # noqa: F401
    KeyGenerationService,
    KeyGenerationRequest,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_request(**overrides) -> KeyGenerationRequest:
    defaults = dict(
        alias="test-key",
        snowflake_account="myaccount.us-east-1",
        snowflake_username="ALICE",
        snowflake_role=None,
        environment="DEV",
        key_slot="RSA_PUBLIC_KEY",
        key_size=2048,
        is_encrypted=False,
        passphrase=None,
        expiration_date=None,
        description=None,
    )
    defaults.update(overrides)
    return KeyGenerationRequest(**defaults)


# ---------------------------------------------------------------------------
# generate_key_pair — happy paths
# ---------------------------------------------------------------------------

class TestGenerateKeyPairReturnsFields:
    def test_returns_private_key_pem(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert hasattr(result, "private_key_pem")
        assert isinstance(result.private_key_pem, str)

    def test_returns_public_key_pem(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert hasattr(result, "public_key_pem")

    def test_returns_public_key_value(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert hasattr(result, "public_key_value")

    def test_returns_snowflake_sql(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert hasattr(result, "snowflake_sql")

    def test_returns_installation_instructions(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert hasattr(result, "installation_instructions")

    def test_returns_auth_examples(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert hasattr(result, "auth_examples")


class TestUnencryptedPrivateKey:
    def test_2048_private_key_pem_header(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request(key_size=2048))
        assert result.private_key_pem.startswith("-----BEGIN PRIVATE KEY-----"), (
            "Unencrypted 2048-bit key must start with -----BEGIN PRIVATE KEY-----"
        )

    def test_4096_private_key_pem_header(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request(key_size=4096))
        assert result.private_key_pem.startswith("-----BEGIN PRIVATE KEY-----"), (
            "Unencrypted 4096-bit key must start with -----BEGIN PRIVATE KEY-----"
        )


class TestEncryptedPrivateKey:
    def test_encrypted_key_pem_header(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(
            _make_request(is_encrypted=True, passphrase="SuperSecret123!")
        )
        assert result.private_key_pem.startswith("-----BEGIN ENCRYPTED PRIVATE KEY-----"), (
            "Encrypted key must start with -----BEGIN ENCRYPTED PRIVATE KEY-----"
        )


class TestPublicKey:
    def test_public_key_pem_header(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert result.public_key_pem.startswith("-----BEGIN PUBLIC KEY-----")

    def test_public_key_value_no_newlines(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert "\n" not in result.public_key_value

    def test_public_key_value_no_begin_header(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert "BEGIN" not in result.public_key_value

    def test_public_key_value_no_end_footer(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert "END" not in result.public_key_value

    def test_public_key_value_no_spaces(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert " " not in result.public_key_value


class TestSnowflakeSql:
    def test_sql_for_rsa_public_key_slot(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request(key_slot="RSA_PUBLIC_KEY"))
        assert "SET RSA_PUBLIC_KEY" in result.snowflake_sql

    def test_sql_for_rsa_public_key_2_slot(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request(key_slot="RSA_PUBLIC_KEY_2"))
        assert "SET RSA_PUBLIC_KEY_2" in result.snowflake_sql

    def test_sql_for_rsa_public_key_does_not_contain_key_2_suffix(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request(key_slot="RSA_PUBLIC_KEY"))
        # Should contain SET RSA_PUBLIC_KEY but not SET RSA_PUBLIC_KEY_2
        assert "SET RSA_PUBLIC_KEY_2" not in result.snowflake_sql


class TestInstallationInstructions:
    def test_installation_instructions_non_empty(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert result.installation_instructions, "installation_instructions must not be empty"

    def test_installation_instructions_contains_chmod(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert "chmod 600" in result.installation_instructions


class TestAuthExamples:
    def test_auth_examples_contains_snowflake_connector(self):
        svc = KeyGenerationService()
        result = svc.generate_key_pair(_make_request())
        assert "snowflake.connector" in result.auth_examples


# ---------------------------------------------------------------------------
# generate_key_pair — validation errors
# ---------------------------------------------------------------------------

class TestValidationErrors:
    def test_raises_for_key_size_1024(self):
        svc = KeyGenerationService()
        with pytest.raises(ValueError, match="1024"):
            svc.generate_key_pair(_make_request(key_size=1024))

    def test_raises_for_encrypted_without_passphrase(self):
        svc = KeyGenerationService()
        with pytest.raises(ValueError):
            svc.generate_key_pair(_make_request(is_encrypted=True, passphrase=None))

    def test_raises_for_weak_passphrase_too_short(self):
        svc = KeyGenerationService()
        with pytest.raises(ValueError):
            svc.generate_key_pair(_make_request(is_encrypted=True, passphrase="Short1!"))

    def test_raises_for_weak_passphrase_no_uppercase(self):
        svc = KeyGenerationService()
        with pytest.raises(ValueError):
            svc.generate_key_pair(_make_request(is_encrypted=True, passphrase="alllowercase123!"))

    def test_raises_for_weak_passphrase_no_digit(self):
        svc = KeyGenerationService()
        with pytest.raises(ValueError):
            svc.generate_key_pair(_make_request(is_encrypted=True, passphrase="NoDigitsHere!!"))

    def test_raises_for_weak_passphrase_no_special_char(self):
        svc = KeyGenerationService()
        with pytest.raises(ValueError):
            svc.generate_key_pair(_make_request(is_encrypted=True, passphrase="NoSpecialChar1"))
