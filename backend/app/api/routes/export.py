"""Export route handlers."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.deps import get_export_service
from app.dependencies import get_current_user
from app.models import User
from app.schemas.common import Graph
from app.schemas.export import ExportResult
from app.services import ExportService

router = APIRouter(prefix="/export", tags=["export"])


@router.post("", response_model=ExportResult)
async def export_graph(
    format: str,
    graph: Graph,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ExportService, Depends(get_export_service)],
) -> ExportResult:
    """Export an arbitrary graph payload sent by the client."""
    del user
    return service.export(format, graph, project_name="architecture")


@router.post("/projects/{project_id}/{format}", response_model=ExportResult)
async def export_project(
    project_id: UUID,
    format: str,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ExportService, Depends(get_export_service)],
) -> ExportResult:
    """Export a persisted project's graph."""
    return await service.export_project(format, user.id, project_id)
