"""Project CRUD route handlers."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.deps import get_project_service
from app.dependencies import get_current_user
from app.models import User
from app.schemas.common import Graph
from app.schemas.project import (
    ProjectCreate,
    ProjectListOut,
    ProjectOut,
    ProjectUpdate,
)
from app.services import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=ProjectListOut)
async def list_projects(
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> ProjectListOut:
    items = await service.list_for_user(user.id)
    return ProjectListOut(items=items, total=len(items))


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> ProjectOut:
    return await service.create(user.id, body)


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> ProjectOut:
    return await service.get_for_user(user.id, project_id)


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: UUID,
    body: ProjectUpdate,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> ProjectOut:
    return await service.update(user.id, project_id, body)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> None:
    await service.delete(user.id, project_id)


@router.put("/{project_id}/graph", response_model=ProjectOut)
async def save_graph(
    project_id: UUID,
    body: Graph,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> ProjectOut:
    """Full-graph save used by the editor's autosave."""
    return await service.save_graph(user.id, project_id, body)
