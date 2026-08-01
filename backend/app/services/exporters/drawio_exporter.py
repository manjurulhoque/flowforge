"""draw.io (mxGraph XML) exporter.

Emits a single ``mxGraphModel`` XML document that opens directly in
draw.io / diagrams.net. Vertex geometry uses fixed node dimensions and the
canvas coordinates from the graph.
"""

import html

from app.schemas.common import Graph
from app.services.exporters.base import Exporter

NODE_WIDTH = 170
NODE_HEIGHT = 64


class DrawioExporter(Exporter):
    format = "drawio"
    mime_type = "application/xml"

    def export(self, graph: Graph, *, project_name: str) -> str:
        cells: list[str] = []

        for node in graph.nodes:
            safe_label = html.escape(node.data.label, quote=True)
            style = self._style_for(node.data.category, node.data.color)
            x, y = round(node.position.x), round(node.position.y)
            cells.append(
                f'<mxCell id={node.id!r} value={safe_label!r} style={style!r} vertex="1" '
                f'parent="1"><mxGeometry x="{x}" y="{y}" width="{NODE_WIDTH}" '
                f'height="{NODE_HEIGHT}" as="geometry"/></mxCell>'
            )

        for edge in graph.edges:
            kind = (edge.data or {}).get("kind", "rest")
            label = (edge.data or {}).get("label", "")
            style = self._edge_style(kind)
            cells.append(
                f'<mxCell id="{edge.id}" value="{html.escape(str(label), quote=True)}" '
                f'style="{style}" edge="1" parent="1" source="{edge.source}" '
                f'target="{edge.target}"><mxGeometry relative="1" as="geometry"/></mxCell>'
            )

        cells_xml = "\n    ".join(cells)
        return (
            '<mxfile host="app.diagrams.net"><diagram id="flowforge" '
            f'name="{html.escape(project_name, quote=True)}">'
            '<mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" '
            'guides="1" tooltips="1" connect="1" arrows="1" fold="1" '
            'page="1" pageScale="1" pageWidth="1920" pageHeight="1080">'
            '<root><mxCell id="0"/><mxCell id="1" parent="0"/>'
            f"{cells_xml}"
            "</root></mxGraphModel></diagram></mxfile>"
        )

    @staticmethod
    def _style_for(category: str, color: str) -> str:
        fill = color or _CATEGORY_FILL.get(category, "#e2e8f0")
        stroke = _CATEGORY_STROKE.get(category, "#64748b")
        return (
            "rounded=1;whiteSpace=wrap;html=1;arcSize=12;"
            f"fillColor={fill};strokeColor={stroke};"
            "fontStyle=1;fontSize=12;verticalAlign=middle;"
            "spacingLeft=8;spacingRight=8;"
        )

    @staticmethod
    def _edge_style(kind: str) -> str:
        dash = "dashed=1;" if kind in ("kafka-pub", "kafka-sub") else ""
        animated = "1" if kind in ("rabbitmq", "kafka-pub") else "0"
        return (
            f"edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;"
            f"jettySize=auto;html=1;strokeColor=#64748b;{dash}endArrow=block;"
            f"animated={animated};"
        )


_CATEGORY_FILL = {
    "services": "#dbeafe",
    "databases": "#ede9fe",
    "messaging": "#fef3c7",
    "cache": "#fee2e2",
    "infrastructure": "#d1fae5",
    "external": "#f1f5f9",
    "custom": "#f8fafc",
}

_CATEGORY_STROKE = {
    "services": "#2563eb",
    "databases": "#7c3aed",
    "messaging": "#d97706",
    "cache": "#dc2626",
    "infrastructure": "#059669",
    "external": "#64748b",
    "custom": "#94a3b8",
}
