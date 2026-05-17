# RED: This test file is intentionally failing (imports non-existent modules)
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.services.auth_service import (  # noqa: F401
    hash_password,
    verify_password,
    create_access_token,
    register_user,
)


class TestHashPassword:
    def test_hash_password_returns_string(self):
        result = hash_password("SecurePass123!")
        assert isinstance(result, str)

    def test_hash_password_differs_from_input(self):
        plain = "SecurePass123!"
        result = hash_password(plain)
        assert result != plain

    def test_hash_password_produces_different_hashes_for_same_input(self):
        # bcrypt salts each hash
        h1 = hash_password("SecurePass123!")
        h2 = hash_password("SecurePass123!")
        assert h1 != h2


class TestVerifyPassword:
    def test_verify_password_returns_true_for_correct_password(self):
        plain = "SecurePass123!"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_verify_password_returns_false_for_wrong_password(self):
        hashed = hash_password("SecurePass123!")
        assert verify_password("WrongPassword!", hashed) is False

    def test_verify_password_returns_false_for_empty_string(self):
        hashed = hash_password("SecurePass123!")
        assert verify_password("", hashed) is False


class TestCreateAccessToken:
    def test_create_access_token_returns_string(self):
        token = create_access_token({"sub": str(uuid4())})
        assert isinstance(token, str)

    def test_create_access_token_is_jwt_format(self):
        token = create_access_token({"sub": str(uuid4())})
        # JWT has three dot-separated parts
        parts = token.split(".")
        assert len(parts) == 3

    def test_create_access_token_encodes_subject(self):
        import base64
        import json

        user_id = str(uuid4())
        token = create_access_token({"sub": user_id})
        # Decode the payload section (second part)
        payload_b64 = token.split(".")[1]
        # Add padding as needed
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        assert payload["sub"] == user_id


class TestRegisterUser:
    @pytest.mark.asyncio
    async def test_register_user_stores_hashed_password(self):
        db = AsyncMock()
        db.add = MagicMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()

        user_data = {
            "email": "alice@example.com",
            "password": "SecurePass123!",
            "full_name": "Alice",
        }

        # Capture the object added to the session
        created_user = None

        def capture_add(obj):
            nonlocal created_user
            created_user = obj

        db.add.side_effect = capture_add

        with patch("app.services.auth_service.get_user_by_email", new_callable=AsyncMock, return_value=None):
            await register_user(db, user_data["email"], user_data["password"], user_data["full_name"])

        assert created_user is not None
        assert created_user.hashed_password != user_data["password"], (
            "register_user must store hashed_password, not plain text"
        )
        assert not hasattr(created_user, "password") or created_user.__dict__.get("password") is None, (
            "register_user must not set a 'password' attribute"
        )
