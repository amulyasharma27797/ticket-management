import uuid
from uuid import UUID

from fastapi.testclient import TestClient

from app.database.session import SessionLocal
from app.models.enums import UserRole
from app.models.user import User

DEFAULT_PASSWORD = "Password1"


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
        json={"name": "Users Test", "email": email, "password": DEFAULT_PASSWORD},
    )
    assert response.status_code == 201, response.text
    data = response.json()["data"]
    if role is not None:
        _set_user_role(data["user"]["id"], role)
    return data


def _auth_header(data: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {data['accessToken']}"}


def test_list_users_admin_only(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)
    regular = _register(client, role=UserRole.USER)
    _register(client, role=UserRole.AGENT)

    response = client.get("/api/v1/users", headers=_auth_header(admin))

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    emails = {user["email"] for user in body["data"]}
    assert admin["user"]["email"] in emails
    assert regular["user"]["email"] in emails


def test_list_users_forbidden_for_regular_user(client: TestClient) -> None:
    user = _register(client, role=UserRole.USER)

    response = client.get("/api/v1/users", headers=_auth_header(user))

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_get_user_admin_or_agent(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)
    target = _register(client, role=UserRole.USER)

    response = client.get(
        f"/api/v1/users/{target['user']['id']}",
        headers=_auth_header(admin),
    )

    assert response.status_code == 200
    assert response.json()["data"]["email"] == target["user"]["email"]


def test_get_user_forbidden_for_regular_user(client: TestClient) -> None:
    user = _register(client, role=UserRole.USER)
    target = _register(client, role=UserRole.AGENT)

    response = client.get(
        f"/api/v1/users/{target['user']['id']}",
        headers=_auth_header(user),
    )

    assert response.status_code == 403


def test_get_user_not_found(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)

    response = client.get(
        f"/api/v1/users/{uuid.uuid4()}",
        headers=_auth_header(admin),
    )

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"


def test_create_user_not_implemented(client: TestClient) -> None:
    admin = _register(client, role=UserRole.ADMIN)

    response = client.post("/api/v1/users", headers=_auth_header(admin), json={})

    assert response.status_code == 501
    assert response.json()["error"]["code"] == "NOT_IMPLEMENTED"
