"""OpenAPI 3.1 skeleton exporter.

Emits a minimal but valid OpenAPI document: one placeholder path per
REST / GraphQL / gRPC edge that targets a node exposing a port, so the
spec can grow into a full API contract.
"""

from app.schemas.common import Graph
from app.services.exporters.base import Exporter
from app.services.exporters.shared import emit_block, slug

_API_KINDS = ("rest", "graphql", "grpc")


class OpenApiExporter(Exporter):
    format = "openapi"
    mime_type = "text/yaml"

    def export(self, graph: Graph, *, project_name: str) -> str:
        by_id = {node.id: node for node in graph.nodes}
        paths: dict[str, dict[str, object]] = {}

        for edge in graph.edges:
            kind = (edge.data or {}).get("kind", "rest")
            if kind not in _API_KINDS:
                continue
            target = by_id.get(edge.target)
            if target is None or not target.data.config.port:
                continue
            path = f"/{slug(target.data.label)}"
            paths.setdefault(path, {})["get"] = {
                "summary": f"Generated endpoint ({kind})",
                "responses": {"200": {"description": "OK"}},
            }

        doc: dict[str, object] = {
            "openapi": "3.1.0",
            "info": {"title": project_name, "version": "0.1.0"},
            "servers": [{"url": "http://localhost:8000"}],
            "paths": paths,
        }
        return "\n".join(emit_block(doc)) + "\n"
