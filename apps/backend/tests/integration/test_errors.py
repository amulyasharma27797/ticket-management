import uuid

from fastapi.testclient import TestClient

from app.core.middleware import REQUEST_ID_HEADER

DEFAULT_PASSWORD = "Password1"


def _assert_error_envelope(body: dict, *, code: str, status_code: int) -> None:
    assert body["success"] is False
    assert body["error"]["code"] == code
    assert isinstance(body["error"]["message"], str)
    assert body["error"]["message"]
    assert isinstance(body["error"]["details"], list)
    assert status_code >= 400


def test_validation_error_envelope(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "A", "email": "not-an-email", "password": "short"},
    )

    body = response.json()
    assert response.status_code == 422
    _assert_error_envelope(body, code="VALIDATION_ERROR", status_code=422)
    assert body["error"]["details"]
    assert all("field" in detail and "message" in detail for detail in body["error"]["details"])


def test_not_found_envelope(client: TestClient) -> None:
    response = client.get("/api/v1/does-not-exist")

    body = response.json()
    assert response.status_code == 404
    _assert_error_envelope(body, code="NOT_FOUND", status_code=404)


def test_forbidden_envelope(client: TestClient, auth_headers) -> None:
    headers = auth_headers()
    create_response = client.post(
        "/api/v1/tickets",
        headers=headers,
        json={
            "title": "Forbidden status test",
            "description": "Testing forbidden status change from regular user.",
            "priority": "low",
        },
    )
    ticket_id = create_response.json()["data"]["id"]

    response = client.patch(
        f"/api/v1/tickets/{ticket_id}/status",
        headers=headers,
        json={"status": "in_progress"},
    )

    body = response.json()
    assert response.status_code == 403
    _assert_error_envelope(body, code="FORBIDDEN", status_code=403)


def test_unauthenticated_envelope(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")

    body = response.json()
    assert response.status_code == 401
    _assert_error_envelope(body, code="UNAUTHORIZED", status_code=401)


def test_unhandled_error_envelope(client: TestClient) -> None:
    from app.main import app

    def boom() -> dict:
        raise RuntimeError("boom")

    app.add_api_route("/api/v1/_test-boom", boom, methods=["GET"])
    response = client.get("/api/v1/_test-boom")

    body = response.json()
    assert response.status_code == 500
    _assert_error_envelope(body, code="INTERNAL_ERROR", status_code=500)


def test_request_id_header(client: TestClient) -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert REQUEST_ID_HEADER in response.headers
    assert response.headers[REQUEST_ID_HEADER]


def test_request_id_header_echoes_incoming_value(client: TestClient) -> None:
    request_id = f"test-{uuid.uuid4()}"
    response = client.get("/api/v1/health", headers={REQUEST_ID_HEADER: request_id})

    assert response.status_code == 200
    assert response.headers[REQUEST_ID_HEADER] == request_id
