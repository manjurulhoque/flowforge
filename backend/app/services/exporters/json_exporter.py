"""JSON exporter — canonical FlowForge document format."""

import json

from app.schemas.common import Graph
from app.services.exporters.base import Exporter

EXPORT_VERSION = "1.0"


class JsonExporter(Exporter):
    format = "json"
    mime_type = "application/json"

    def export(self, graph: Graph, *, project_name: str) -> str:
        document = {
            "version": EXPORT_VERSION,
            "name": project_name,
            "nodes": [
                {
                    "id": n.id,
                    "type": n.data.type_key,
                    "label": n.data.label,
                    "position": {"x": n.position.x, "y": n.position.y},
                    "data": n.data.model_dump(by_alias=True, mode="json"),
                }
                for n in graph.nodes
            ],
            "edges": [
                {
                    "id": e.id,
                    "source": e.source,
                    "target": e.target,
                    "kind": (e.data or {}).get("kind", "rest"),
                    "label": (e.data or {}).get("label", ""),
                }
                for e in graph.edges
            ],
        }
        return json.dumps(document, indent=2)
