"""End-to-end API tests for project CRUD and graph persistence."""

from httpx import AsyncClient
from tests.conftest import auth_headers

SAMPLE_GRAPH = {
    "nodes": [
        {
            "id": "gw",
            "position": {"x": 0.0, "y": 0.0},
            "type": "arch",
            "data": {
                "label": "API Gateway",
                "typeKey": "api-gateway",
                "category": "infrastructure",
            },
        },
        {
            "id": "svc",
            "position": {"x": 120.0, "y": 40.0},
            "type": "arch",
            "data": {
                "label": "Orders API",
                "typeKey": "fastapi",
                "category": "services",
                "config": {"replicas": 2},
            },
        },
    ],
    "edges": [
        {
            "id": "e1",
            "source": "gw",
            "target": "svc",
            "type": "arch",
            "data": {"kind": "rest", "label": "REST"},
        }
    ],
}


async def create_project(client: AsyncClient, tokens: dict, **overrides) -> dict:
    payload = {"name": overrides.pop("name", "Orders Platform"), **overrides}
    resp = await client.post(
        "/api/projects", json=payload, headers=auth_headers(tokens)
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_create_and_list_projects(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    created = await create_project(client, tokens, description="Microservices")
    assert created["name"] == "Orders Platform"
    assert created["nodeCount"] == 0
    assert created["graph"] == {"nodes": [], "edges": []}

    listing = await client.get("/api/projects", headers=auth_headers(tokens))
    assert listing.status_code == 200
    body = listing.json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == created["id"]


async def test_get_project(client: AsyncClient, registered_user: dict) -> None:
    tokens = registered_user
    created = await create_project(client, tokens)
    resp = await client.get(
        f"/api/projects/{created['id']}", headers=auth_headers(tokens)
    )
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


async def test_save_graph_round_trip(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    created = await create_project(client, tokens)
    resp = await client.put(
        f"/api/projects/{created['id']}/graph",
        json=SAMPLE_GRAPH,
        headers=auth_headers(tokens),
    )
    assert resp.status_code == 200, resp.text
    saved = resp.json()
    assert saved["nodeCount"] == 2
    assert saved["edgeCount"] == 1
    node_ids = {n["id"] for n in saved["graph"]["nodes"]}
    assert node_ids == {"gw", "svc"}
    # camelCase aliases survive the round trip
    assert saved["graph"]["nodes"][1]["data"]["typeKey"] == "fastapi"
    assert saved["graph"]["nodes"][1]["data"]["config"]["replicas"] == 2

    # Fetching again returns the same graph
    fetched = await client.get(
        f"/api/projects/{created['id']}", headers=auth_headers(tokens)
    )
    assert fetched.json()["graph"] == saved["graph"]


async def test_update_project(client: AsyncClient, registered_user: dict) -> None:
    tokens = registered_user
    created = await create_project(client, tokens)
    resp = await client.put(
        f"/api/projects/{created['id']}",
        json={"name": "Renamed Platform", "status": "archived"},
        headers=auth_headers(tokens),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Renamed Platform"
    assert body["status"] == "archived"


async def test_delete_project(client: AsyncClient, registered_user: dict) -> None:
    tokens = registered_user
    created = await create_project(client, tokens)
    resp = await client.delete(
        f"/api/projects/{created['id']}", headers=auth_headers(tokens)
    )
    assert resp.status_code == 204
    gone = await client.get(
        f"/api/projects/{created['id']}", headers=auth_headers(tokens)
    )
    assert gone.status_code == 404


async def test_ownership_isolation(client: AsyncClient, registered_user: dict) -> None:
    alice = registered_user
    created = await create_project(client, alice)

    bob = await client.post(
        "/api/auth/register",
        json={"email": "bob@bob.example", "password": "correcthorse123"},
    )
    bob_tokens = bob.json()

    resp = await client.get(
        f"/api/projects/{created['id']}", headers=auth_headers(bob_tokens)
    )
    assert resp.status_code == 404


async def test_validate_project_endpoint(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    created = await create_project(client, tokens)
    await client.put(
        f"/api/projects/{created['id']}/graph",
        json=SAMPLE_GRAPH,
        headers=auth_headers(tokens),
    )
    resp = await client.post(
        f"/api/validation/projects/{created['id']}",
        headers=auth_headers(tokens),
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    codes = {i["code"] for i in body["issues"]}
    assert "missing-authentication" in codes


async def test_validate_anonymous_graph(client: AsyncClient) -> None:
    resp = await client.post("/api/validation", json=SAMPLE_GRAPH)
    assert resp.status_code == 200
    codes = {i["code"] for i in resp.json()["issues"]}
    assert "missing-api-gateway" not in codes  # gateway present
    assert "missing-authentication" in codes
