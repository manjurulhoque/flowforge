"""Validation route handlers."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.dependencies import get_current_user, get_optional_user
from app.dependencies.db import get_db
from app.models import User
from app.repositories import ProjectRepository
from app.schemas.common import Graph
from app.schemas.validation import ValidationResult
from app.services.validation import run_validation

router = APIRouter(prefix="/validation", tags=["validation"])


@router.post("", response_model=ValidationResult)
async def validate_graph(
    graph: Graph,
    user: Annotated[User | None, Depends(get_optional_user)],
) -> ValidationResult:
    """Validate an arbitrary graph payload (optionally authenticated).

    ``user`` is accepted for future rate-limit / quota policies; validation
    itself is stateless and safe to call anonymously.
    """
    del user
    return run_validation(graph)


@router.post("/projects/{project_id}", response_model=ValidationResult)
async def validate_project(
    project_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> ValidationResult:
    """Validate a persisted project's graph."""
    repo = ProjectRepository(session)
    project = await repo.get_with_graph(project_id)
    if project is None or project.owner_id != user.id:
        raise NotFoundError(message="Project not found")
    graph = Graph(
        nodes=[
            {
                "id": n.id,
                "position": {"x": n.position_x, "y": n.position_y},
                "data": n.data,
                "type": "arch",
            }
            for n in project.nodes
        ],
        edges=[
            {
                "id": e.id,
                "source": e.source,
                "target": e.target,
                "data": e.data,
            }
            for e in project.edges
        ],
    )
    return run_validation(graph)
