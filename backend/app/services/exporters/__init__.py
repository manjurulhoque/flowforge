"""Exporter registry — the single place new formats are wired in."""

from app.services.exporters.base import ExportRegistry, UnsupportedFormatError
from app.services.exporters.docker_exporter import DockerComposeExporter
from app.services.exporters.drawio_exporter import DrawioExporter
from app.services.exporters.json_exporter import JsonExporter
from app.services.exporters.k8s_exporter import KubernetesExporter
from app.services.exporters.mermaid_exporter import MermaidExporter
from app.services.exporters.openapi_exporter import OpenApiExporter
from app.services.exporters.plantuml_exporter import PlantUmlExporter
from app.services.exporters.terraform_exporter import TerraformExporter


def build_registry() -> ExportRegistry:
    """Construct the registry with every bundled exporter."""
    registry = ExportRegistry()
    for exporter in (
        JsonExporter(),
        MermaidExporter(),
        DockerComposeExporter(),
        DrawioExporter(),
        KubernetesExporter(),
        TerraformExporter(),
        PlantUmlExporter(),
        OpenApiExporter(),
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
