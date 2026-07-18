import csv
import io
import uuid
from uuid import UUID

from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.models.enums import UserRole
from app.models.user import User

DEFAULT_PASSWORD = "Password1"
VALID_TICKET = {
    "title": "Export ticket",
    "description": "Ticket used to verify CSV export of self-created tickets.",
    "priority": "medium",
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
        json={"name": "Export User", "email": email, "password": DEFAULT_PASSWORD},
    )
    assert response.status_code == 201, response.text
    data = response.json()["data"]
    if role is not None:
        _set_user_role(data["user"]["id"], role)
    return data


def _auth_header(data: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {data['accessToken']}"}


def _create_ticket(
    client: TestClient, headers: dict[str, str], *, title: str | None = None
) -> dict:
    payload = {**VALID_TICKET}
    if title is not None:
        payload["title"] = title
    response = client.post("/api/v1/tickets", headers=headers, json=payload)
    assert response.status_code == 201, response.text
    return response.json()["data"]


def test_export_returns_csv_for_created_tickets(client: TestClient) -> None:
    user = _register(client)
    headers = _auth_header(user)
    created = _create_ticket(client, headers, title="My export ticket")

    response = client.get("/api/v1/tickets/export", headers=headers)

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert 'attachment; filename="my-tickets.csv"' in response.headers["content-disposition"]

    rows = list(csv.DictReader(io.StringIO(response.text)))
    assert len(rows) == 1
    assert rows[0]["id"] == created["id"]
    assert rows[0]["title"] == "My export ticket"
    assert rows[0]["status"] == "open"
    assert rows[0]["priority"] == "medium"


def test_export_only_includes_self_created_tickets(client: TestClient) -> None:
    owner = _register(client)
    other = _register(client)
    owner_headers = _auth_header(owner)
    other_headers = _auth_header(other)

    own_ticket = _create_ticket(client, owner_headers, title="Owner ticket")
    _create_ticket(client, other_headers, title="Other user ticket")

    response = client.get("/api/v1/tickets/export", headers=owner_headers)

    assert response.status_code == 200
    rows = list(csv.DictReader(io.StringIO(response.text)))
    titles = {row["title"] for row in rows}
    ids = {row["id"] for row in rows}

    assert titles == {"Owner ticket"}
    assert own_ticket["id"] in ids


def test_export_admin_still_scoped_to_self_created(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)
    user = _register(client)
    admin_headers = _auth_header(admin)
    user_headers = _auth_header(user)

    admin_ticket = _create_ticket(client, admin_headers, title="Admin created")
    _create_ticket(client, user_headers, title="User created")

    response = client.get("/api/v1/tickets/export", headers=admin_headers)

    assert response.status_code == 200
    rows = list(csv.DictReader(io.StringIO(response.text)))
    assert len(rows) == 1
    assert rows[0]["id"] == admin_ticket["id"]


def test_export_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/v1/tickets/export")
    assert response.status_code == 401


def test_export_empty_when_user_created_no_tickets(client: TestClient) -> None:
    user = _register(client)
    headers = _auth_header(user)

    response = client.get("/api/v1/tickets/export", headers=headers)

    assert response.status_code == 200
    rows = list(csv.DictReader(io.StringIO(response.text)))
    assert rows == []
