"""Mermaid flowchart exporter.

Emits a ``graph LR`` diagram with per-category styling via ``classDef``.
"""

from app.schemas.common import Graph
from app.services.exporters.base import Exporter

CATEGORY_COLORS = {
    "services": "#3b82f6",
    "databases": "#8b5cf6",
    "messaging": "#f59e0b",
    "cache": "#ef4444",
    "infrastructure": "#10b981",
    "external": "#64748b",
    "custom": "#94a3b8",
}

EDGE_MARKERS = {
    "rest": ("-->", "REST"),
    "graphql": ("-->", "GraphQL"),
    "grpc": ("-->>", "gRPC"),
    "kafka-pub": ("-.->", "publish"),
    "kafka-sub": ("-.->", "subscribe"),
    "rabbitmq": ("-->>", "RabbitMQ"),
    "database": ("-->", ""),
    "internal": ("---", "internal"),
}


class MermaidExporter(Exporter):
    format = "mermaid"
    mime_type = "text/vnd.mermaid"

    def export(self, graph: Graph, *, project_name: str) -> str:
        safe = lambda s: str(s).replace('"', "'")  # noqa: E731
        lines = ["graph LR", f'  subgraph "FlowForge · {safe(project_name)}"']

        for node in graph.nodes:
            lines.append(
                f'    {safe(node.id)}["{safe(node.data.label)}"]:::{node.data.category}'
            )

        for edge in graph.edges:
            marker, label = EDGE_MARKERS.get(
                (edge.data or {}).get("kind", "rest"), ("-->", "")
            )
            text = f"|{safe(label)}|" if label else ""
            lines.append(f"    {safe(edge.source)} {marker}{text} {safe(edge.target)}")

        lines.append("  end")

        for category, color in CATEGORY_COLORS.items():
            lines.append(
                f"  classDef {category} fill:{color}22,stroke:{color},color:{color}"
            )
        return "\n".join(lines) + "\n"
