# RED: This test file is intentionally failing (imports non-existent modules)
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app  # noqa: F401


pytestmark = pytest.mark.asyncio

_USER = {"email": "settings_user@example.com", "password": "SecurePass123!", "full_name": "Alice"}


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


async def _register_and_login(client: AsyncClient) -> str:
    await client.post("/auth/register", json=_USER)
    resp = await client.post(
        "/auth/login", data={"username": _USER["email"], "password": _USER["password"]}
    )
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class TestGetSettings:
    async def test_get_settings_returns_200(self, client):
        token = await _register_and_login(client)
        resp = await client.get("/settings", headers=_auth(token))
        assert resp.status_code == 200

    async def test_get_settings_returns_user_fields(self, client):
        token = await _register_and_login(client)
        resp = await client.get("/settings", headers=_auth(token))
        body = resp.json()
        assert "full_name" in body
        assert "email" in body

    async def test_get_settings_returns_401_without_auth(self, client):
        resp = await client.get("/settings")
        assert resp.status_code == 401


class TestPutSettings:
    async def test_put_settings_returns_200_with_valid_data(self, client):
        token = await _register_and_login(client)
        resp = await client.put(
            "/settings",
            json={"full_name": "Alice Updated"},
            headers=_auth(token),
        )
        assert resp.status_code == 200

    async def test_put_settings_updates_full_name(self, client):
        token = await _register_and_login(client)
        await client.put("/settings", json={"full_name": "New Name"}, headers=_auth(token))
        resp = await client.get("/settings", headers=_auth(token))
        assert resp.json()["full_name"] == "New Name"

    async def test_put_settings_updates_default_environment(self, client):
        token = await _register_and_login(client)
        await client.put("/settings", json={"default_environment": "PROD"}, headers=_auth(token))
        resp = await client.get("/settings", headers=_auth(token))
        assert resp.json()["default_environment"] == "PROD"

    async def test_put_settings_response_contains_updated_fields(self, client):
        token = await _register_and_login(client)
        resp = await client.put(
            "/settings",
            json={
                "full_name": "Alice B",
                "default_environment": "QA",
                "default_key_size": 4096,
            },
            headers=_auth(token),
        )
        body = resp.json()
        assert body["full_name"] == "Alice B"
        assert body["default_environment"] == "QA"
        assert body["default_key_size"] == 4096
