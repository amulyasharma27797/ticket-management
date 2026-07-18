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


def test_create_ticket(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.post("/api/v1/tickets", headers=headers, json=VALID_TICKET)

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "open"
    assert body["data"]["priority"] == "high"
    assert body["data"]["title"] == VALID_TICKET["title"]


def test_create_ticket_unauthenticated(client: TestClient) -> None:
    response = client.post("/api/v1/tickets", json=VALID_TICKET)
    assert response.status_code == 401


def test_create_ticket_validation(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.post(
        "/api/v1/tickets",
        headers=headers,
        json={"title": "ab", "description": "short"},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_get_ticket_detail(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    created = _create_ticket(client, headers)
    response = client.get(f"/api/v1/tickets/{created['id']}", headers=headers)

    assert response.status_code == 200
    assert response.json()["data"]["id"] == created["id"]
    assert response.json()["data"]["commentCount"] == 0


def test_get_ticket_not_found(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.get(f"/api/v1/tickets/{uuid.uuid4()}", headers=headers)
    assert response.status_code == 404


def test_get_ticket_forbidden(client: TestClient) -> None:
    owner = _register(client)
    other = _register(client)
    ticket = _create_ticket(client, _auth_header(owner))

    response = client.get(f"/api/v1/tickets/{ticket['id']}", headers=_auth_header(other))
    assert response.status_code == 404


def test_update_title(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/title",
        headers=headers,
        json={"title": "Updated login issue"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["title"] == "Updated login issue"


def test_update_description(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/description",
        headers=headers,
        json={"description": "Updated description with more than ten characters."},
    )

    assert response.status_code == 200
    assert "Updated description" in response.json()["data"]["description"]


def test_update_priority(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/priority",
        headers=headers,
        json={"priority": "critical"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["priority"] == "critical"


def test_reassign_ticket_agent(client: TestClient) -> None:
    agent = _register(client, role=UserRole.AGENT)
    assignee = _register(
        client, email=f"agent-{uuid.uuid4().hex[:8]}@example.com", role=UserRole.AGENT
    )
    ticket = _create_ticket(client, _auth_header(agent))

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/assign",
        headers=_auth_header(agent),
        json={"assignedToId": assignee["user"]["id"]},
    )

    assert response.status_code == 200
    assert response.json()["data"]["assignedToId"] == assignee["user"]["id"]


def test_reassign_ticket_user_forbidden(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/assign",
        headers=headers,
        json={"assignedToId": None},
    )
    assert response.status_code == 403


def test_list_tickets(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    _create_ticket(client, headers)
    response = client.get("/api/v1/tickets", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert len(body["data"]) >= 1
    assert body["meta"]["total"] >= 1


def test_list_tickets_filter_by_status(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)
    headers = _auth_header(admin)
    ticket = _create_ticket(client, headers)
    client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=headers,
        json={"status": "in_progress"},
    )

    open_response = client.get("/api/v1/tickets?status=open", headers=headers)
    in_progress_response = client.get("/api/v1/tickets?status=in_progress", headers=headers)

    assert open_response.status_code == 200
    assert all(item["status"] == "open" for item in open_response.json()["data"])
    assert in_progress_response.status_code == 200
    assert any(item["id"] == ticket["id"] for item in in_progress_response.json()["data"])


def test_list_tickets_filter_by_priority(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    client.patch(
        f"/api/v1/tickets/{ticket['id']}/priority",
        headers=headers,
        json={"priority": "critical"},
    )

    response = client.get("/api/v1/tickets?priority=critical", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["meta"]["total"] >= 1
    assert all(item["priority"] == "critical" for item in body["data"])


def test_list_tickets_search_by_title(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)

    response = client.get("/api/v1/tickets?search=Login", headers=headers)

    assert response.status_code == 200
    ids = [item["id"] for item in response.json()["data"]]
    assert ticket["id"] in ids


def test_list_tickets_search_by_description(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)

    response = client.get("/api/v1/tickets?search=password%20reset", headers=headers)

    assert response.status_code == 200
    ids = [item["id"] for item in response.json()["data"]]
    assert ticket["id"] in ids


def test_list_tickets_pagination(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    for index in range(3):
        client.post(
            "/api/v1/tickets",
            headers=headers,
            json={
                "title": f"Pagination ticket {index}",
                "description": "Ticket created to verify pagination behavior.",
                "priority": "low",
            },
        )

    page_one = client.get("/api/v1/tickets?page=1&pageSize=2", headers=headers)
    page_two = client.get("/api/v1/tickets?page=2&pageSize=2", headers=headers)

    assert page_one.status_code == 200
    assert page_two.status_code == 200
    assert len(page_one.json()["data"]) == 2
    assert page_one.json()["meta"]["page"] == 1
    assert page_one.json()["meta"]["pageSize"] == 2
    assert page_one.json()["meta"]["total"] >= 3
    assert page_one.json()["meta"]["totalPages"] >= 2

    page_one_ids = {item["id"] for item in page_one.json()["data"]}
    page_two_ids = {item["id"] for item in page_two.json()["data"]}
    assert page_one_ids.isdisjoint(page_two_ids)


def test_list_tickets_user_visibility_with_filters(client: TestClient) -> None:
    owner = _register(client)
    other = _register(client)
    owner_headers = _auth_header(owner)
    other_headers = _auth_header(other)
    ticket = _create_ticket(client, owner_headers)

    owner_response = client.get("/api/v1/tickets?search=Login", headers=owner_headers)
    other_response = client.get("/api/v1/tickets?search=Login", headers=other_headers)

    assert owner_response.status_code == 200
    assert any(item["id"] == ticket["id"] for item in owner_response.json()["data"])
    assert other_response.status_code == 200
    assert all(item["id"] != ticket["id"] for item in other_response.json()["data"])


def test_update_status_admin(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)
    ticket = _create_ticket(client, _auth_header(admin))

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=_auth_header(admin),
        json={"status": "in_progress"},
    )

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "in_progress"


def test_update_status_user_forbidden(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    ticket = _create_ticket(client, headers)
    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=headers,
        json={"status": "in_progress"},
    )
    assert response.status_code == 403


def test_update_status_agent(client: TestClient) -> None:
    agent = _register(client, role=UserRole.AGENT)
    ticket = _create_ticket(client, _auth_header(agent))
    headers = _auth_header(agent)

    to_progress = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=headers,
        json={"status": "in_progress"},
    )
    assert to_progress.status_code == 200

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=headers,
        json={"status": "resolved"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "resolved"


def test_update_status_follows_state_machine(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)
    ticket = _create_ticket(client, _auth_header(admin))
    headers = _auth_header(admin)

    for status in ("in_progress", "resolved", "closed"):
        response = client.patch(
            f"/api/v1/tickets/{ticket['id']}/status",
            headers=headers,
            json={"status": status},
        )
        assert response.status_code == 200, response.text
        assert response.json()["data"]["status"] == status


def test_update_status_invalid_transition(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)
    ticket = _create_ticket(client, _auth_header(admin))

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=_auth_header(admin),
        json={"status": "closed"},
    )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_STATUS_TRANSITION"
