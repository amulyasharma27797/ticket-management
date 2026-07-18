import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient

from app.main import app

ROOT = Path(__file__).resolve().parents[3]


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
