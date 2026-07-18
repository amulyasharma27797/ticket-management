import os
import uuid
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient

from app.main import app

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_PASSWORD = "Password1"


@pytest.fixture(scope="session", autouse=True)
def apply_migrations() -> None:
    if os.getenv("SKIP_MIGRATIONS") == "1":
        return

    cfg = Config(str(ROOT / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "migrations"))
    command.upgrade(cfg, "head")


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def register_user(
    client: TestClient,
    *,
    email: str | None = None,
    password: str = DEFAULT_PASSWORD,
    name: str = "Test User",
) -> dict:
    user_email = email or f"user-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"name": name, "email": user_email, "password": password},
    )
    assert response.status_code == 201, response.text
    return response.json()["data"]


@pytest.fixture
def auth_headers(client: TestClient):
    def _factory(*, email: str | None = None, password: str = DEFAULT_PASSWORD) -> dict[str, str]:
        data = register_user(client, email=email, password=password)
        return {"Authorization": f"Bearer {data['accessToken']}"}

    return _factory
