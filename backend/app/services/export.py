"""Export orchestration service."""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ServiceUnavailableError
from app.repositories import ProjectRepository
from app.schemas.common import Graph
from app.schemas.export import ExportResult
from app.services.exporters import (
    ExportRegistry,
    UnsupportedFormatError,
    default_registry,
)
from app.services.graph_assembly import graph_from_rows


class ExportService:
    """Renders graphs into deployable/documentation formats."""

    def __init__(
        self,
        session: AsyncSession,
        registry: ExportRegistry | None = None,
    ):
        self._session = session
        self.registry = registry or default_registry

    def export(self, fmt: str, graph: Graph, *, project_name: str) -> ExportResult:
        try:
            return self.registry.build(fmt, graph, project_name=project_name)
        except UnsupportedFormatError as exc:
            raise ServiceUnavailableError(
                message=(
                    f"Format '{fmt}' is not available on the server — it is rendered "
                    "client-side (PNG/SVG) or not yet implemented."
                )
            ) from exc

    async def export_project(
        self, fmt: str, user_id: UUID, project_id: UUID
    ) -> ExportResult:
        projects = ProjectRepository(self._session)
        project = await projects.get_with_graph(project_id)
        if project is None or project.owner_id != user_id:
            raise NotFoundError(message="Project not found")
        graph = graph_from_rows(project.nodes, project.edges)
        return self.export(fmt, graph, project_name=project.name)
