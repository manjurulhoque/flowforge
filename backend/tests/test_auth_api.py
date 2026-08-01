"""End-to-end API tests for the auth flow."""

from httpx import AsyncClient
from tests.conftest import auth_headers


async def test_register_returns_token_pair(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/auth/register",
        json={"email": "bob@example.com", "password": "correcthorse123"},
    )
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"


async def test_register_rejects_duplicate_email(client: AsyncClient) -> None:
    payload = {"email": "dup@example.com", "password": "correcthorse123"}
    first = await client.post("/api/auth/register", json=payload)
    assert first.status_code == 201
    second = await client.post("/api/auth/register", json=payload)
    assert second.status_code == 409
    assert second.json()["error"]["code"] == "conflict"


async def test_register_validates_password_length(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/auth/register", json={"email": "short@example.com", "password": "abc"}
    )
    assert resp.status_code == 422


async def test_login_and_me(client: AsyncClient, registered_user: dict) -> None:
    login = await client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "hunter2hunter2"},
    )
    assert login.status_code == 200, login.text
    tokens = login.json()

    me = await client.get("/api/auth/me", headers=auth_headers(tokens))
    assert me.status_code == 200
    profile = me.json()
    assert profile["email"] == "alice@example.com"
    assert profile["id"]


async def test_login_wrong_password(client: AsyncClient, registered_user: dict) -> None:
    resp = await client.post(
        "/api/auth/login",
        json={"email": "alice@example.com", "password": "wrong-password"},
    )
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "unauthorized"


async def test_refresh_rotates_tokens(
    client: AsyncClient, registered_user: dict
) -> None:
    first = registered_user
    rotated = await client.post(
        "/api/auth/refresh", json={"refresh_token": first["refresh_token"]}
    )
    assert rotated.status_code == 200, rotated.text
    new_tokens = rotated.json()
    assert new_tokens["access_token"] != first["access_token"]
    assert new_tokens["refresh_token"] != first["refresh_token"]


async def test_refresh_token_reuse_is_rejected(
    client: AsyncClient, registered_user: dict
) -> None:
    old_token = registered_user["refresh_token"]
    await client.post("/api/auth/refresh", json={"refresh_token": old_token})
    # Rotation revokes the old token; replaying it must fail.
    replay = await client.post("/api/auth/refresh", json={"refresh_token": old_token})
    assert replay.status_code == 401


async def test_logout_revokes_refresh_token(
    client: AsyncClient, registered_user: dict
) -> None:
    logout = await client.post(
        "/api/auth/logout", json={"refresh_token": registered_user["refresh_token"]}
    )
    assert logout.status_code == 204
    replay = await client.post(
        "/api/auth/refresh", json={"refresh_token": registered_user["refresh_token"]}
    )
    assert replay.status_code == 401


async def test_me_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/auth/me")
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "unauthorized"


async def test_health(client: AsyncClient) -> None:
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
