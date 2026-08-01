"""Exporter framework.

Exporters implement :class:`Exporter` (one method!) and register
themselves with an :class:`ExportRegistry`. Adding a new format (Terraform,
Kubernetes manifests, …) is a new module + one registration line.
"""

from typing import Protocol

from app.schemas.common import Graph
from app.schemas.export import ExportResult


class Exporter(Protocol):
    """Contract every exporter satisfies."""

    format: str
    mime_type: str

    def export(self, graph: Graph, *, project_name: str) -> str:
        """Render ``graph`` into this exporter's text format."""
        ...


class UnsupportedFormatError(ValueError):
    """Raised when a requested export format has no registered exporter."""

    def __init__(self, fmt: str):
        super().__init__(f"Unsupported export format: {fmt!r}")
        self.format = fmt


class ExportRegistry:
    """Format → exporter lookup table."""

    def __init__(self) -> None:
        self._exporters: dict[str, Exporter] = {}

    def register(self, exporter: Exporter) -> None:
        if exporter.format in self._exporters:
            raise ValueError(f"Duplicate exporter for format {exporter.format!r}")
        self._exporters[exporter.format] = exporter

    def get(self, fmt: str) -> Exporter:
        try:
            return self._exporters[fmt]
        except KeyError as exc:
            raise UnsupportedFormatError(fmt) from exc

    @property
    def formats(self) -> list[str]:
        return sorted(self._exporters)

    def build(self, fmt: str, graph: Graph, *, project_name: str) -> ExportResult:
        exporter = self.get(fmt)
        content = exporter.export(graph, project_name=project_name)
        return ExportResult(
            format=fmt,
            content=content,
            filename=_safe_filename(project_name, fmt),
            mime_type=exporter.mime_type,
        )


def _safe_filename(project_name: str, fmt: str) -> str:
    slug = "".join(c if c.isalnum() or c in "-_" else "-" for c in project_name).strip(
        "-"
    )
    return f"{slug or 'architecture'}.{fmt}"
