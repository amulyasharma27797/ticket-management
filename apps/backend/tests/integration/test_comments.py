import uuid
from uuid import UUID

from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.models.enums import UserRole
from app.models.user import User

DEFAULT_PASSWORD = "Password1"
VALID_TICKET = {
    "title": "Login issue",
    "description": "User cannot sign in to the application after password reset.",
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
        json={"name": "Test User", "email": email, "password": DEFAULT_PASSWORD},
    )
    assert response.status_code == 201, response.text
    data = response.json()["data"]
    if role is not None:
        _set_user_role(data["user"]["id"], role)
    return data


def _auth_header(data: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {data['accessToken']}"}


def _create_ticket(client: TestClient, headers: dict[str, str]) -> dict:
    response = client.post("/api/v1/tickets", headers=headers, json=VALID_TICKET)
    assert response.status_code == 201, response.text
    return response.json()["data"]


def test_add_comment(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    response = client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        headers=headers,
        json={"message": "Please check the password reset email link."},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["message"] == "Please check the password reset email link."
    assert body["data"]["ticketId"] == ticket["id"]
    assert body["data"]["createdBy"]["name"] == "Test User"
    assert "id" in body["data"]["createdBy"]


def test_add_comment_empty_message(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    response = client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        headers=headers,
        json={"message": "   "},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_list_comments(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    first = client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        headers=headers,
        json={"message": "First update on this ticket."},
    )
    second = client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        headers=headers,
        json={"message": "Second update on this ticket."},
    )
    assert first.status_code == 201
    assert second.status_code == 201

    response = client.get(f"/api/v1/tickets/{ticket['id']}/comments", headers=headers)

    assert response.status_code == 200
    comments = response.json()["data"]
    assert len(comments) == 2
    assert comments[0]["message"] == "First update on this ticket."
    assert comments[1]["message"] == "Second update on this ticket."
    assert comments[0]["createdAt"] <= comments[1]["createdAt"]


def test_add_comment_forbidden(client: TestClient) -> None:
    owner = _register(client)
    other = _register(client)
    ticket = _create_ticket(client, _auth_header(owner))

    response = client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        headers=_auth_header(other),
        json={"message": "I should not be able to comment here."},
    )

    assert response.status_code == 404


def test_list_comments_forbidden(client: TestClient) -> None:
    owner = _register(client)
    other = _register(client)
    ticket = _create_ticket(client, _auth_header(owner))

    response = client.get(
        f"/api/v1/tickets/{ticket['id']}/comments",
        headers=_auth_header(other),
    )

    assert response.status_code == 404


def test_add_comment_unauthenticated(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    response = client.post(
        f"/api/v1/tickets/{ticket['id']}/comments",
        json={"message": "No auth header."},
    )
    assert response.status_code == 401
