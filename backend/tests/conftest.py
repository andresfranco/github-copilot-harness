# RED: imports will fail until implementation exists
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app as fastapi_app  # noqa: F401 — module does not exist yet


@pytest.fixture
def app():
    """Return the FastAPI application instance."""
    return fastapi_app


@pytest.fixture
async def async_client(app):
    """Return an async HTTPX client wired to the FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


@pytest.fixture
def test_user_data():
    """Return a dict with valid registration fields."""
    return {
        "email": "test_user@example.com",
        "password": "SecurePass123!",
        "full_name": "Test User",
    }


@pytest.fixture
def second_user_data():
    """Return a second distinct user for ownership-isolation tests."""
    return {
        "email": "other_user@example.com",
        "password": "OtherPass456@",
        "full_name": "Other User",
    }
