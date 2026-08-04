"""Canonical graph hashing for version deduplication."""

from __future__ import annotations

import hashlib
import json

from app.schemas.common import Graph


def graph_content_hash(graph: Graph) -> str:
    """Stable SHA-256 of a graph payload (camelCase, sorted keys)."""
    payload = graph.model_dump(by_alias=True, mode="json")
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
