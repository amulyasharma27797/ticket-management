import uuid
from uuid import UUID

from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.models.enums import UserRole
from app.models.user import User

DEFAULT_PASSWORD = "Password1"
VALID_TICKET = {
    "title": "Stats ticket",
    "description": "Ticket used to verify dashboard stats aggregation.",
    "priority": "high",
}


def _set_user_role(user_id: str, role: UserRole) -> None:
    db = SessionLocal()
    try:
        user = db.get(User, UUID(user_id))
        assert user is not None
        user.role = role
        db.commit()
    finally:
        db.close()


def _register(
    client: TestClient, *, email: str | None = None, role: UserRole | None = None
) -> dict:
    email = email or f"user-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Stats User", "email": email, "password": DEFAULT_PASSWORD},
    )
    assert response.status_code == 201, response.text
    data = response.json()["data"]
    if role is not None:
        _set_user_role(data["user"]["id"], role)
    return data


def _auth_header(data: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {data['accessToken']}"}


def _create_ticket(client: TestClient, headers: dict[str, str], *, priority: str = "high") -> dict:
    response = client.post(
        "/api/v1/tickets",
        headers=headers,
        json={**VALID_TICKET, "priority": priority},
    )
    assert response.status_code == 201, response.text
    return response.json()["data"]


def test_ticket_stats_returns_counts(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)
    headers = _auth_header(admin)
    _create_ticket(client, headers, priority="high")
    _create_ticket(client, headers, priority="low")

    response = client.get("/api/v1/tickets/stats", headers=headers)

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["total"] >= 2
    assert body["byStatus"]["open"] >= 2
    assert body["byPriority"]["high"] >= 1
    assert body["byPriority"]["low"] >= 1
    assert set(body["byStatus"].keys()) == {
        "open",
        "in_progress",
        "resolved",
        "closed",
        "cancelled",
    }


def test_ticket_stats_role_user_scoped(client: TestClient) -> None:
    owner = _register(client)
    other = _register(client)
    owner_headers = _auth_header(owner)
    other_headers = _auth_header(other)
    _create_ticket(client, owner_headers)

    owner_stats = client.get("/api/v1/tickets/stats", headers=owner_headers)
    other_stats = client.get("/api/v1/tickets/stats", headers=other_headers)

    assert owner_stats.status_code == 200
    assert other_stats.status_code == 200
    assert owner_stats.json()["data"]["total"] >= 1
    assert other_stats.json()["data"]["total"] == 0


def test_ticket_stats_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/v1/tickets/stats")
    assert response.status_code == 401
