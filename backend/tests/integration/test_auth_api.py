# RED: This test file is intentionally failing (imports non-existent modules)
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app  # noqa: F401


pytestmark = pytest.mark.asyncio


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.fixture
def register_payload():
    return {
        "email": "alice@example.com",
        "password": "SecurePass123!",
        "full_name": "Alice",
    }


@pytest.fixture
def second_register_payload():
    return {
        "email": "bob@example.com",
        "password": "BobSecure456@",
        "full_name": "Bob",
    }


async def _register_and_login(client: AsyncClient, payload: dict) -> str:
    """Helper: register a user and return a bearer token."""
    await client.post("/auth/register", json=payload)
    resp = await client.post(
        "/auth/login",
        data={"username": payload["email"], "password": payload["password"]},
    )
    return resp.json()["access_token"]


class TestRegister:
    async def test_register_returns_201_with_valid_data(self, client, register_payload):
        resp = await client.post("/auth/register", json=register_payload)
        assert resp.status_code == 201

    async def test_register_response_contains_id_and_email(self, client, register_payload):
        resp = await client.post("/auth/register", json=register_payload)
        body = resp.json()
        assert "id" in body
        assert body["email"] == register_payload["email"]

    async def test_register_duplicate_email_returns_400(self, client, register_payload):
        await client.post("/auth/register", json=register_payload)
        resp = await client.post("/auth/register", json=register_payload)
        assert resp.status_code == 400

    async def test_register_response_does_not_contain_password(self, client, register_payload):
        resp = await client.post("/auth/register", json=register_payload)
        body = resp.json()
        assert "password" not in body
        assert "hashed_password" not in body


class TestLogin:
    async def test_login_returns_200_with_access_token(self, client, register_payload):
        await client.post("/auth/register", json=register_payload)
        resp = await client.post(
            "/auth/login",
            data={"username": register_payload["email"], "password": register_payload["password"]},
        )
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    async def test_login_returns_401_for_wrong_password(self, client, register_payload):
        await client.post("/auth/register", json=register_payload)
        resp = await client.post(
            "/auth/login",
            data={"username": register_payload["email"], "password": "WrongPassword!"},
        )
        assert resp.status_code == 401

    async def test_login_token_type_is_bearer(self, client, register_payload):
        await client.post("/auth/register", json=register_payload)
        resp = await client.post(
            "/auth/login",
            data={"username": register_payload["email"], "password": register_payload["password"]},
        )
        assert resp.json().get("token_type", "").lower() == "bearer"


class TestGetMe:
    async def test_get_me_returns_401_without_token(self, client):
        resp = await client.get("/auth/me")
        assert resp.status_code == 401

    async def test_get_me_returns_200_with_valid_token(self, client, register_payload):
        token = await _register_and_login(client, register_payload)
        resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

    async def test_get_me_response_does_not_contain_password_key(self, client, register_payload):
        token = await _register_and_login(client, register_payload)
        resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        body = resp.json()
        assert "password" not in body
        assert "hashed_password" not in body

    async def test_get_me_response_contains_email(self, client, register_payload):
        token = await _register_and_login(client, register_payload)
        resp = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.json()["email"] == register_payload["email"]
