"""Unit tests for the exporter registry and bundled exporters."""

import json

import pytest
from app.schemas.common import Graph
from app.services.exporters import UnsupportedFormatError, build_registry


def sample_graph() -> Graph:
    return Graph(
        nodes=[
            {
                "id": "gw",
                "position": {"x": 10.0, "y": 20.0},
                "data": {
                    "label": "API Gateway",
                    "typeKey": "api-gateway",
                    "category": "infrastructure",
                },
                "type": "arch",
            },
            {
                "id": "svc",
                "position": {"x": 40.0, "y": 60.0},
                "data": {
                    "label": "Orders API",
                    "typeKey": "fastapi",
                    "category": "services",
                    "config": {"replicas": 2, "port": 8000},
                },
                "type": "arch",
            },
            {
                "id": "db",
                "position": {"x": 80.0, "y": 100.0},
                "data": {
                    "label": "Orders DB",
                    "typeKey": "postgresql",
                    "category": "databases",
                },
                "type": "arch",
            },
        ],
        edges=[
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
                "data": {"kind": "sql", "label": "SQL"},
            },
        ],
    )


@pytest.fixture
def registry():
    return build_registry()


def test_registry_lists_formats(registry) -> None:
    assert set(registry.formats) == {
        "json",
        "mermaid",
        "docker",
        "drawio",
        "k8s",
        "terraform",
        "plantuml",
        "openapi",
    }


def test_unsupported_format_raises(registry) -> None:
    with pytest.raises(UnsupportedFormatError):
        registry.build("png", sample_graph(), project_name="x")


def test_json_export(registry) -> None:
    result = registry.build("json", sample_graph(), project_name="Store")
    assert result.format == "json"
    assert result.mime_type == "application/json"
    doc = json.loads(result.content)
    assert doc["version"].startswith("1.")
    assert doc["name"] == "Store"
    assert {n["id"] for n in doc["nodes"]} == {"gw", "svc", "db"}
    assert doc["nodes"][1]["position"] == {"x": 40.0, "y": 60.0}


def test_mermaid_export(registry) -> None:
    result = registry.build("mermaid", sample_graph(), project_name="Store")
    assert "graph LR" in result.content
    assert "API Gateway" in result.content
    assert "Orders API" in result.content


def test_docker_export(registry) -> None:
    result = registry.build("docker", sample_graph(), project_name="Store")
    assert result.mime_type == "text/yaml"
    assert "services:" in result.content
    assert "postgres:16" in result.content or "postgres" in result.content
    assert "replicas: 2" in result.content


def test_drawio_export(registry) -> None:
    result = registry.build("drawio", sample_graph(), project_name="Store")
    assert result.mime_type == "application/xml"
    assert "mxGraphModel" in result.content
    assert "API Gateway" in result.content
    assert "mxCell" in result.content


def test_k8s_export(registry) -> None:
    result = registry.build("k8s", sample_graph(), project_name="Store")
    assert result.mime_type == "text/yaml"
    assert "kind: Deployment" in result.content
    assert "kind: Service" in result.content
    assert "orders-api" in result.content
    assert "replicas: 2" in result.content
    assert "postgres:16-alpine" in result.content


def test_terraform_export(registry) -> None:
    result = registry.build("terraform", sample_graph(), project_name="Store")
    assert result.mime_type == "text/hcl"
    assert 'resource "docker_container" "orders-api"' in result.content
    assert "kreuzwerker/docker" in result.content
    assert "internal = 8000" in result.content


def test_plantuml_export(registry) -> None:
    result = registry.build("plantuml", sample_graph(), project_name="Store")
    assert result.mime_type == "text/plain"
    assert "@startuml" in result.content
    assert "Orders API" in result.content
    assert "gw --> svc : REST" in result.content
    assert "svc --> db" in result.content


def test_openapi_export(registry) -> None:
    result = registry.build("openapi", sample_graph(), project_name="Store")
    assert result.mime_type == "text/yaml"
    assert "openapi: 3.1.0" in result.content
    # REST edge into the port-bearing service becomes a path; the SQL
    # edge into a database (no port) does not.
    assert "/orders-api:" in result.content
    assert "/orders-db:" not in result.content
