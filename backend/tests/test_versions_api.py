"""API tests for project version history."""

from httpx import AsyncClient
from tests.conftest import auth_headers
from tests.test_projects_api import SAMPLE_GRAPH, create_project

GRAPH_V2 = {
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
                "config": {"replicas": 3},
            },
        },
        {
            "id": "db",
            "position": {"x": 240.0, "y": 80.0},
            "type": "arch",
            "data": {
                "label": "Orders DB",
                "typeKey": "postgres",
                "category": "databases",
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
        },
        {
            "id": "e2",
            "source": "svc",
            "target": "db",
            "type": "arch",
            "data": {"kind": "db", "label": "SQL"},
        },
    ],
}


async def _save_graph(client: AsyncClient, tokens: dict, project_id: str, graph: dict):
    resp = await client.put(
        f"/api/projects/{project_id}/graph",
        json=graph,
        headers=auth_headers(tokens),
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


async def test_save_creates_version(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    project = await create_project(client, tokens)

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(tokens),
    )
    assert listing.status_code == 200
    assert listing.json()["total"] == 0

    await _save_graph(client, tokens, project["id"], SAMPLE_GRAPH)

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(tokens),
    )
    body = listing.json()
    assert body["total"] == 1
    assert body["items"][0]["version"] == 1
    assert body["items"][0]["nodeCount"] == 2
    assert body["items"][0]["edgeCount"] == 1
    assert body["items"][0]["label"] is None


async def test_duplicate_save_skips_version(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    project = await create_project(client, tokens)
    await _save_graph(client, tokens, project["id"], SAMPLE_GRAPH)
    await _save_graph(client, tokens, project["id"], SAMPLE_GRAPH)

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(tokens),
    )
    assert listing.json()["total"] == 1


async def test_changed_save_creates_second_version(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    project = await create_project(client, tokens)
    await _save_graph(client, tokens, project["id"], SAMPLE_GRAPH)
    await _save_graph(client, tokens, project["id"], GRAPH_V2)

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(tokens),
    )
    body = listing.json()
    assert body["total"] == 2
    assert [item["version"] for item in body["items"]] == [2, 1]
    assert body["items"][0]["nodeCount"] == 3


async def test_get_version_includes_graph(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    project = await create_project(client, tokens)
    await _save_graph(client, tokens, project["id"], SAMPLE_GRAPH)

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(tokens),
    )
    version_id = listing.json()["items"][0]["id"]

    detail = await client.get(
        f"/api/projects/{project['id']}/versions/{version_id}",
        headers=auth_headers(tokens),
    )
    assert detail.status_code == 200
    body = detail.json()
    assert body["graph"]["nodes"][0]["id"] == "gw"
    assert body["graph"]["nodes"][1]["data"]["typeKey"] == "fastapi"


async def test_named_checkpoint(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    project = await create_project(client, tokens)
    await _save_graph(client, tokens, project["id"], SAMPLE_GRAPH)

    resp = await client.post(
        f"/api/projects/{project['id']}/versions",
        json={"label": "Before refactor"},
        headers=auth_headers(tokens),
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["label"] == "Before refactor"
    assert resp.json()["version"] == 2

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(tokens),
    )
    # Named checkpoint forces a new row even with identical content.
    assert listing.json()["total"] == 2


async def test_restore_version(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    project = await create_project(client, tokens)
    await _save_graph(client, tokens, project["id"], SAMPLE_GRAPH)
    await _save_graph(client, tokens, project["id"], GRAPH_V2)

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(tokens),
    )
    v1 = next(item for item in listing.json()["items"] if item["version"] == 1)

    restored = await client.post(
        f"/api/projects/{project['id']}/versions/{v1['id']}/restore",
        headers=auth_headers(tokens),
    )
    assert restored.status_code == 200, restored.text
    body = restored.json()
    assert body["nodeCount"] == 2
    assert {n["id"] for n in body["graph"]["nodes"]} == {"gw", "svc"}

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(tokens),
    )
    items = listing.json()["items"]
    assert listing.json()["total"] == 3
    assert items[0]["version"] == 3
    assert items[0]["label"] == "Restored from v1"


async def test_versions_require_ownership(
    client: AsyncClient, registered_user: dict
) -> None:
    tokens = registered_user
    project = await create_project(client, tokens)
    await _save_graph(client, tokens, project["id"], SAMPLE_GRAPH)

    other = await client.post(
        "/api/auth/register",
        json={"email": "bob@example.com", "password": "hunter2hunter2"},
    )
    assert other.status_code == 201
    other_tokens = other.json()

    listing = await client.get(
        f"/api/projects/{project['id']}/versions",
        headers=auth_headers(other_tokens),
    )
    assert listing.status_code == 404
