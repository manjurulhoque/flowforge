"""Unit tests for the validation engine and its rules."""

from app.schemas.common import Graph
from app.services.validation import run_validation


def build_graph(nodes: list[dict], edges: list[dict] | None = None) -> Graph:
    """Build a :class:`Graph` from minimal dicts."""
    return Graph(
        nodes=[
            {
                "id": n["id"],
                "position": {"x": 0.0, "y": 0.0},
                "data": {
                    "label": n.get("label", n["id"]),
                    "typeKey": n["typeKey"],
                    "category": n.get("category", "custom"),
                    "config": n.get("config", {}),
                },
                "type": "arch",
            }
            for n in nodes
        ],
        edges=[
            {
                "id": e["id"],
                "source": e["source"],
                "target": e["target"],
                "type": "arch",
            }
            for e in (edges or [])
        ],
    )


def service(nid: str, *, type_key: str = "service", replicas: int = 1) -> dict:
    return {
        "id": nid,
        "typeKey": type_key,
        "category": "services",
        "config": {"replicas": replicas},
    }


def test_missing_api_gateway() -> None:
    graph = build_graph([service("a"), service("b")])
    result = run_validation(graph)
    assert any(
        i.code == "missing-api-gateway" and i.severity == "warning"
        for i in result.issues
    )


def test_api_gateway_present_suppresses_warning() -> None:
    graph = build_graph(
        [service("gw", type_key="api-gateway"), service("a"), service("b")],
        [{"id": "e1", "source": "gw", "target": "a"}],
    )
    result = run_validation(graph)
    assert not any(i.code == "missing-api-gateway" for i in result.issues)


def test_missing_authentication() -> None:
    graph = build_graph([service("a")])
    result = run_validation(graph)
    assert any(i.code == "missing-authentication" for i in result.issues)


def test_public_database_is_error_and_invalidates() -> None:
    graph = build_graph(
        [
            {"id": "ext", "typeKey": "external-api", "category": "external"},
            {"id": "db", "typeKey": "postgresql", "category": "databases"},
        ],
        [{"id": "e1", "source": "ext", "target": "db"}],
    )
    result = run_validation(graph)
    assert any(
        i.code == "public-database" and i.severity == "error" for i in result.issues
    )
    assert result.summary.error_count >= 1
    assert result.summary.valid is False


def test_circular_dependency_between_services() -> None:
    graph = build_graph(
        [service("a"), service("b")],
        [
            {"id": "e1", "source": "a", "target": "b"},
            {"id": "e2", "source": "b", "target": "a"},
        ],
    )
    result = run_validation(graph)
    assert any(
        i.code == "circular-dependency" and i.severity == "error" for i in result.issues
    )


def test_shared_database_above_threshold() -> None:
    graph = build_graph(
        [
            service("s1"),
            service("s2"),
            service("s3"),
            {"id": "db", "typeKey": "postgresql", "category": "databases"},
        ],
        [
            {"id": "e1", "source": "s1", "target": "db"},
            {"id": "e2", "source": "s2", "target": "db"},
            {"id": "e3", "source": "s3", "target": "db"},
        ],
    )
    result = run_validation(graph)
    issue = next(i for i in result.issues if i.code == "shared-database")
    assert "db" in issue.affected_node_ids
    assert issue.related_edge_ids == ["e1", "e2", "e3"]


def test_single_kafka_broker_warns() -> None:
    graph = build_graph([{"id": "k", "typeKey": "kafka", "category": "messaging"}])
    result = run_validation(graph)
    assert any(
        i.code == "single-kafka-broker" and i.severity == "warning"
        for i in result.issues
    )


def test_isolated_nodes_warn() -> None:
    graph = build_graph([service("a"), service("b")])
    result = run_validation(graph)
    isolated = [i for i in result.issues if i.code == "isolated-node"]
    assert {nid for i in isolated for nid in i.affected_node_ids} == {"a", "b"}


def test_single_replica_is_info() -> None:
    graph = build_graph([service("a", replicas=1)])
    result = run_validation(graph)
    assert any(
        i.code == "single-replica" and i.severity == "info" for i in result.issues
    )


def test_well_architected_system_is_valid() -> None:
    graph = build_graph(
        [
            service("gw", type_key="api-gateway"),
            service("auth", type_key="auth"),
            service("orders", replicas=2),
            service("inventory", replicas=2),
            {"id": "db", "typeKey": "postgresql", "category": "databases"},
            {"id": "cache", "typeKey": "redis", "category": "cache"},
            {"id": "prom", "typeKey": "prometheus", "category": "infrastructure"},
        ],
        [
            {"id": "e1", "source": "gw", "target": "auth"},
            {"id": "e2", "source": "gw", "target": "orders"},
            {"id": "e3", "source": "gw", "target": "inventory"},
            {"id": "e4", "source": "orders", "target": "db"},
            {"id": "e5", "source": "inventory", "target": "db"},
            {"id": "e6", "source": "orders", "target": "cache"},
            {"id": "e7", "source": "inventory", "target": "cache"},
            {"id": "e8", "source": "orders", "target": "prom"},
            {"id": "e9", "source": "inventory", "target": "prom"},
        ],
    )
    result = run_validation(graph)
    assert result.summary.valid is True, [i.code for i in result.issues]
    assert result.summary.error_count == 0
