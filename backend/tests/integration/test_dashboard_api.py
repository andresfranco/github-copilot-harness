# RED: This test file is intentionally failing (imports non-existent modules)
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app  # noqa: F401


pytestmark = pytest.mark.asyncio

_USER_A = {"email": "dash_user_a@example.com", "password": "SecurePass123!", "full_name": "Alice"}
_USER_B = {"email": "dash_user_b@example.com", "password": "BobSecure456@", "full_name": "Bob"}

_KEY_PAYLOAD = {
    "alias": "dash-key",
    "snowflake_account": "myaccount.us-east-1",
    "snowflake_username": "ALICE",
    "snowflake_role": None,
    "environment": "DEV",
    "key_slot": "RSA_PUBLIC_KEY",
    "key_size": 2048,
    "is_encrypted": False,
    "passphrase": None,
    "expiration_date": None,
    "description": None,
}

_DASHBOARD_KEYS = [
    "total_keys",
    "active_keys",
    "rotating_keys",
    "expired_keys",
    "revoked_keys",
    "expiring_soon",
]


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


async def _register_and_login(client: AsyncClient, user: dict) -> str:
    await client.post("/auth/register", json=user)
    resp = await client.post("/auth/login", data={"username": user["email"], "password": user["password"]})
    return resp.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class TestDashboard:
    async def test_get_dashboard_returns_401_without_auth(self, client):
        resp = await client.get("/dashboard")
        assert resp.status_code == 401

    async def test_get_dashboard_returns_200_with_auth(self, client):
        token = await _register_and_login(client, _USER_A)
        resp = await client.get("/dashboard", headers=_auth(token))
        assert resp.status_code == 200

    async def test_get_dashboard_response_has_required_keys(self, client):
        token = await _register_and_login(client, _USER_A)
        resp = await client.get("/dashboard", headers=_auth(token))
        body = resp.json()
        for key in _DASHBOARD_KEYS:
            assert key in body, f"Dashboard response missing key: {key}"

    async def test_get_dashboard_stats_are_user_scoped(self, client):
        """User B's keys must not be counted in User A's dashboard stats."""
        token_a = await _register_and_login(client, _USER_A)
        token_b = await _register_and_login(client, _USER_B)

        # User B creates a key
        await client.post("/keys", json=_KEY_PAYLOAD, headers=_auth(token_b))

        # User A's dashboard should show 0 total_keys
        resp = await client.get("/dashboard", headers=_auth(token_a))
        body = resp.json()
        assert body["total_keys"] == 0, (
            "Dashboard total_keys must not count keys belonging to other users"
        )

    async def test_get_dashboard_counts_own_active_key(self, client):
        token = await _register_and_login(client, _USER_A)
        await client.post("/keys", json={**_KEY_PAYLOAD, "alias": "count-key"}, headers=_auth(token))

        resp = await client.get("/dashboard", headers=_auth(token))
        body = resp.json()
        assert body["total_keys"] >= 1
        assert body["active_keys"] >= 1
