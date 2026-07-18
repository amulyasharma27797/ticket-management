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
    client: TestClient,
    *,
    email: str | None = None,
    name: str = "Team Viewer",
    role: UserRole | None = None,
) -> dict:
    email = email or f"user-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"name": name, "email": email, "password": DEFAULT_PASSWORD},
    )
    assert response.status_code == 201, response.text
    data = response.json()["data"]
    if role is not None:
        _set_user_role(data["user"]["id"], role)
    return data


def _auth_header(data: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {data['accessToken']}"}


def test_list_team_members_includes_all_registered_users(client: TestClient) -> None:
    new_member = _register(
        client, name="New Member", email=f"member-{uuid.uuid4().hex[:8]}@example.com"
    )
    headers = _auth_header(new_member)

    response = client.get("/api/v1/users/team", headers=headers)

    assert response.status_code == 200
    members = response.json()["data"]
    roles = {member["role"] for member in members}
    names = {member["name"] for member in members}

    assert "admin" in roles
    assert "agent" in roles
    assert "user" in roles
    assert "Admin User" in names
    assert "Agent User" in names
    assert "New Member" in names
    assert new_member["user"]["id"] in {member["id"] for member in members}

    defaults = [member for member in members if member["isDefault"]]
    default_names = {member["name"] for member in defaults}
    assert "Admin User" in default_names
    assert "Agent User" in default_names
    assert "Regular User" in default_names
    assert all(member["isDefault"] is False for member in members if member["name"] == "New Member")


def test_list_team_members_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/v1/users/team")
    assert response.status_code == 401
