# RED: This test file is intentionally failing (imports non-existent modules)
import pytest

from app.models.user import User  # noqa: F401
from app.models.snowflake_key import SnowflakeKey  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401


class TestUserModel:
    def test_user_has_required_attributes(self):
        required = ["id", "email", "hashed_password", "full_name", "default_key_size", "created_at"]
        for attr in required:
            assert hasattr(User, attr), f"User model missing attribute: {attr}"

    def test_user_does_not_have_plain_password_field(self):
        assert not hasattr(User, "password"), (
            "User model must NOT expose a 'password' attribute — only 'hashed_password'"
        )

    def test_user_has_updated_at(self):
        assert hasattr(User, "updated_at")

    def test_user_has_default_fields(self):
        for attr in [
            "default_snowflake_account",
            "default_environment",
            "default_key_slot",
            "default_encrypted",
        ]:
            assert hasattr(User, attr), f"User model missing default field: {attr}"


class TestSnowflakeKeyModel:
    def test_snowflake_key_has_required_attributes(self):
        required = [
            "id",
            "user_id",
            "alias",
            "snowflake_account",
            "snowflake_username",
            "environment",
            "key_slot",
            "key_size",
            "is_encrypted",
            "status",
            "encrypted_private_key",
            "public_key_pem",
            "public_key_value",
            "snowflake_sql",
            "installation_instructions",
            "auth_examples",
        ]
        for attr in required:
            assert hasattr(SnowflakeKey, attr), f"SnowflakeKey model missing attribute: {attr}"

    def test_snowflake_key_does_not_have_plain_private_key_field(self):
        assert not hasattr(SnowflakeKey, "private_key_pem"), (
            "SnowflakeKey model must NOT expose 'private_key_pem' — only 'encrypted_private_key'"
        )

    def test_snowflake_key_has_created_at_and_updated_at(self):
        assert hasattr(SnowflakeKey, "created_at")
        assert hasattr(SnowflakeKey, "updated_at")

    def test_snowflake_key_has_optional_fields(self):
        for attr in ["snowflake_role", "expiration_date", "description"]:
            assert hasattr(SnowflakeKey, attr), f"SnowflakeKey model missing optional field: {attr}"


class TestAuditLogModel:
    def test_audit_log_has_required_attributes(self):
        required = ["id", "key_id", "user_id", "action", "created_at"]
        for attr in required:
            assert hasattr(AuditLog, attr), f"AuditLog model missing attribute: {attr}"

    def test_audit_log_has_optional_metadata_fields(self):
        assert hasattr(AuditLog, "ip_address")
        assert hasattr(AuditLog, "user_agent")
