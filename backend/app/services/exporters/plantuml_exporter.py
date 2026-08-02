"""PlantUML component-diagram exporter.

Counterpart to the Mermaid exporter: renders the same graph as a
``@startuml`` component diagram with per-category colors and edge
markers per connection kind.
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
    "kafka-pub": ("..>", "publish"),
    "kafka-sub": ("..>", "subscribe"),
    "rabbitmq": ("-->>", "RabbitMQ"),
    "database": ("-->", ""),
    "internal": ("--", "internal"),
}


class PlantUmlExporter(Exporter):
    format = "plantuml"
    mime_type = "text/plain"

    def export(self, graph: Graph, *, project_name: str) -> str:
        def safe(s: str) -> str:
            return str(s).replace('"', "'")

        def alias(node_id: str) -> str:
            return safe(node_id.replace("-", "_"))

        lines = [
            "@startuml",
            "skinparam componentStyle rectangle",
            "hide stereotype",
        ]
        for category, color in CATEGORY_COLORS.items():
            lines.append(f"skinparam component<<{category}>> {{")
            lines.append(f"  BackgroundColor {color}22")
            lines.append(f"  BorderColor {color}")
            lines.append("}")
        lines.append("")

        for node in graph.nodes:
            lines.append(
                f'component "{safe(node.data.label)}" as {alias(node.id)} '
                f"<<{node.data.category}>>"
            )
        lines.append("")

        for edge in graph.edges:
            kind = (edge.data or {}).get("kind", "rest")
            marker, label = EDGE_MARKERS.get(kind, ("-->", ""))
            line = f"{alias(edge.source)} {marker} {alias(edge.target)}"
            if label:
                line += f" : {safe(label)}"
            lines.append(line)

        lines.append("@enduml")
        return "\n".join(lines) + "\n"
