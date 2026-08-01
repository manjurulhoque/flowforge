"""Exporter registry — the single place new formats are wired in."""

from app.services.exporters.base import ExportRegistry, UnsupportedFormatError
from app.services.exporters.docker_exporter import DockerComposeExporter
from app.services.exporters.drawio_exporter import DrawioExporter
from app.services.exporters.json_exporter import JsonExporter
from app.services.exporters.mermaid_exporter import MermaidExporter


def build_registry() -> ExportRegistry:
    """Construct the registry with every bundled exporter."""
    registry = ExportRegistry()
    for exporter in (
        JsonExporter(),
        MermaidExporter(),
        DockerComposeExporter(),
        DrawioExporter(),
    ):
        registry.register(exporter)
    return registry


# Process-wide singleton — registries are immutable after construction.
default_registry = build_registry()

__all__ = [
    "ExportRegistry",
    "UnsupportedFormatError",
    "build_registry",
    "default_registry",
]
