"""Unit tests for stable graph content hashing."""

from app.schemas.common import Graph
from app.services.graph_hash import graph_content_hash


def test_graph_hash_stable_across_key_order() -> None:
    a = Graph.model_validate(
        {
            "nodes": [
                {
                    "id": "a",
                    "position": {"x": 1, "y": 2},
                    "data": {"label": "A", "typeKey": "fastapi", "category": "services"},
                }
            ],
            "edges": [],
        }
    )
    b = Graph.model_validate(
        {
            "edges": [],
            "nodes": [
                {
                    "data": {"category": "services", "typeKey": "fastapi", "label": "A"},
                    "position": {"y": 2, "x": 1},
                    "id": "a",
                }
            ],
        }
    )
    assert graph_content_hash(a) == graph_content_hash(b)


def test_graph_hash_changes_when_content_changes() -> None:
    base = Graph.model_validate(
        {
            "nodes": [
                {
                    "id": "a",
                    "position": {"x": 0, "y": 0},
                    "data": {"label": "A", "typeKey": "fastapi", "category": "services"},
                }
            ],
            "edges": [],
        }
    )
    changed = Graph.model_validate(
        {
            "nodes": [
                {
                    "id": "a",
                    "position": {"x": 0, "y": 0},
                    "data": {"label": "B", "typeKey": "fastapi", "category": "services"},
                }
            ],
            "edges": [],
        }
    )
    assert graph_content_hash(base) != graph_content_hash(changed)
