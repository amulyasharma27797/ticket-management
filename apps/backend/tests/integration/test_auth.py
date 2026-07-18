import uuid

from fastapi.testclient import TestClient

DEFAULT_PASSWORD = "Password1"


def test_register_success(client: TestClient) -> None:
    email = f"jane-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jane Doe",
            "email": email,
            "password": DEFAULT_PASSWORD,
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["data"]["user"]["email"] == email
    assert "accessToken" in body["data"]
    assert "refreshToken" in body["data"]
    assert "password" not in body["data"]["user"]


def test_register_duplicate_email(client: TestClient) -> None:
    email = f"duplicate-{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "name": "Jane Doe",
        "email": email,
        "password": DEFAULT_PASSWORD,
    }
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CONFLICT"


def test_register_weak_password(client: TestClient) -> None:
    email = f"weak-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "Jane Doe", "email": email, "password": "short"},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_login_success(client: TestClient) -> None:
    email = f"login-{uuid.uuid4().hex[:8]}@example.com"
    client.post(
        "/api/v1/auth/register",
        json={"name": "Login User", "email": email, "password": DEFAULT_PASSWORD},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": DEFAULT_PASSWORD},
    )

    assert response.status_code == 200
    assert response.json()["data"]["user"]["email"] == email
    assert "accessToken" in response.json()["data"]


def test_login_wrong_password(client: TestClient) -> None:
    email = f"wrongpass-{uuid.uuid4().hex[:8]}@example.com"
    client.post(
        "/api/v1/auth/register",
        json={"name": "Login User", "email": email, "password": DEFAULT_PASSWORD},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPass1"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHORIZED"


def test_me_authenticated(client: TestClient, auth_headers) -> None:
    email = f"me-{uuid.uuid4().hex[:8]}@example.com"
    headers = auth_headers(email=email)
    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["data"]["email"] == email


def test_me_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_refresh_token(client: TestClient) -> None:
    email = f"refresh-{uuid.uuid4().hex[:8]}@example.com"
    register_response = client.post(
        "/api/v1/auth/register",
        json={"name": "Refresh User", "email": email, "password": DEFAULT_PASSWORD},
    )
    refresh_token = register_response.json()["data"]["refreshToken"]

    response = client.post("/api/v1/auth/refresh", json={"refreshToken": refresh_token})

    assert response.status_code == 200
    assert "accessToken" in response.json()["data"]
    assert "refreshToken" in response.json()["data"]


def test_refresh_revoked_token(client: TestClient) -> None:
    email = f"revoked-{uuid.uuid4().hex[:8]}@example.com"
    register_response = client.post(
        "/api/v1/auth/register",
        json={"name": "Logout User", "email": email, "password": DEFAULT_PASSWORD},
    )
    data = register_response.json()["data"]
    headers = {"Authorization": f"Bearer {data['accessToken']}"}
    refresh_token = data["refreshToken"]

    logout_response = client.post(
        "/api/v1/auth/logout",
        headers=headers,
        json={"refreshToken": refresh_token},
    )
    assert logout_response.status_code == 204

    response = client.post("/api/v1/auth/refresh", json={"refreshToken": refresh_token})
    assert response.status_code == 401


def test_logout(client: TestClient) -> None:
    email = f"logout-{uuid.uuid4().hex[:8]}@example.com"
    register_response = client.post(
        "/api/v1/auth/register",
        json={"name": "Logout User", "email": email, "password": DEFAULT_PASSWORD},
    )
    data = register_response.json()["data"]
    headers = {"Authorization": f"Bearer {data['accessToken']}"}

    response = client.post(
        "/api/v1/auth/logout",
        headers=headers,
        json={"refreshToken": data["refreshToken"]},
    )

    assert response.status_code == 204


def test_protected_route_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/v1/protected/ping")
    assert response.status_code == 401


def test_protected_route_authenticated(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    response = client.get("/api/v1/protected/ping", headers=headers)

    assert response.status_code == 200
    assert response.json()["data"]["message"] == "ok"
