import uuid
from itertools import product
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.models.enums import TicketStatus, UserRole
from app.models.user import User
from app.services.ticket_state_machine import ALLOWED_TRANSITIONS

DEFAULT_PASSWORD = "Password1"
VALID_TICKET = {
    "title": "Login issue",
    "description": "User cannot sign in to the application after password reset.",
    "priority": "high",
}

ALL_STATUSES = list(TicketStatus)

VALID_TRANSITIONS = [
    (current, target) for current, targets in ALLOWED_TRANSITIONS.items() for target in targets
]

INVALID_TRANSITIONS = [
    (current, target)
    for current, target in product(ALL_STATUSES, ALL_STATUSES)
    if current != target and target not in ALLOWED_TRANSITIONS.get(current, frozenset())
]

STATUS_SETUP_PATHS: dict[TicketStatus, list[TicketStatus]] = {
    TicketStatus.OPEN: [],
    TicketStatus.IN_PROGRESS: [TicketStatus.IN_PROGRESS],
    TicketStatus.RESOLVED: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
    TicketStatus.CLOSED: [
        TicketStatus.IN_PROGRESS,
        TicketStatus.RESOLVED,
        TicketStatus.CLOSED,
    ],
    TicketStatus.CANCELLED: [TicketStatus.CANCELLED],
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


def _register(client: TestClient, *, role: UserRole = UserRole.ADMIN) -> dict:
    email = f"admin-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "State Machine Admin", "email": email, "password": DEFAULT_PASSWORD},
    )
    assert response.status_code == 201, response.text
    data = response.json()["data"]
    _set_user_role(data["user"]["id"], role)
    return data


def _auth_header(data: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {data['accessToken']}"}


def _create_ticket(client: TestClient, headers: dict[str, str]) -> dict:
    response = client.post("/api/v1/tickets", headers=headers, json=VALID_TICKET)
    assert response.status_code == 201, response.text
    return response.json()["data"]


def _advance_ticket_to_status(
    client: TestClient,
    headers: dict[str, str],
    ticket_id: str,
    status: TicketStatus,
) -> None:
    for step in STATUS_SETUP_PATHS[status]:
        response = client.patch(
            f"/api/v1/tickets/{ticket_id}/status",
            headers=headers,
            json={"status": step.value},
        )
        assert response.status_code == 200, response.text


@pytest.fixture
def admin_headers(client: TestClient) -> dict[str, str]:
    return _auth_header(_register(client))


@pytest.mark.parametrize(("current", "target"), VALID_TRANSITIONS)
def test_valid_status_transition(
    client: TestClient,
    admin_headers: dict[str, str],
    current: TicketStatus,
    target: TicketStatus,
) -> None:
    ticket = _create_ticket(client, admin_headers)
    _advance_ticket_to_status(client, admin_headers, ticket["id"], current)

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=admin_headers,
        json={"status": target.value},
    )

    assert response.status_code == 200, response.text
    assert response.json()["data"]["status"] == target.value


@pytest.mark.parametrize(("current", "target"), INVALID_TRANSITIONS)
def test_invalid_status_transition(
    client: TestClient,
    admin_headers: dict[str, str],
    current: TicketStatus,
    target: TicketStatus,
) -> None:
    ticket = _create_ticket(client, admin_headers)
    _advance_ticket_to_status(client, admin_headers, ticket["id"], current)

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=admin_headers,
        json={"status": target.value},
    )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_STATUS_TRANSITION"


def test_same_status_transition_is_allowed(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    ticket = _create_ticket(client, admin_headers)
    _advance_ticket_to_status(client, admin_headers, ticket["id"], TicketStatus.RESOLVED)

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        headers=admin_headers,
        json={"status": TicketStatus.RESOLVED.value},
    )

    assert response.status_code == 200
    assert response.json()["data"]["status"] == TicketStatus.RESOLVED.value


def test_edit_closed_ticket_title_forbidden(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    ticket = _create_ticket(client, admin_headers)
    _advance_ticket_to_status(client, admin_headers, ticket["id"], TicketStatus.CLOSED)

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/title",
        headers=admin_headers,
        json={"title": "Updated closed ticket title"},
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "TICKET_NOT_EDITABLE"


def test_edit_cancelled_ticket_description_forbidden(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    ticket = _create_ticket(client, admin_headers)
    _advance_ticket_to_status(client, admin_headers, ticket["id"], TicketStatus.CANCELLED)

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/description",
        headers=admin_headers,
        json={"description": "Attempting to edit a cancelled ticket description."},
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "TICKET_NOT_EDITABLE"


def test_edit_closed_ticket_priority_forbidden(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    ticket = _create_ticket(client, admin_headers)
    _advance_ticket_to_status(client, admin_headers, ticket["id"], TicketStatus.CLOSED)

    response = client.patch(
        f"/api/v1/tickets/{ticket['id']}/priority",
        headers=admin_headers,
        json={"priority": "critical"},
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "TICKET_NOT_EDITABLE"
