"""Version history route handlers (nested under projects)."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.deps import get_project_service
from app.dependencies import get_current_user
from app.models import User
from app.schemas.project import ProjectOut
from app.schemas.version import VersionCreate, VersionListOut, VersionOut
from app.services import ProjectService

router = APIRouter(prefix="/projects", tags=["versions"])


@router.get("/{project_id}/versions", response_model=VersionListOut)
async def list_versions(
    project_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> VersionListOut:
    return await service.list_versions(user.id, project_id)


@router.post(
    "/{project_id}/versions",
    response_model=VersionOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_checkpoint(
    project_id: UUID,
    body: VersionCreate,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> VersionOut:
    """Create a named checkpoint from the project's current live graph."""
    return await service.create_checkpoint(user.id, project_id, body)


@router.get("/{project_id}/versions/{version_id}", response_model=VersionOut)
async def get_version(
    project_id: UUID,
    version_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> VersionOut:
    return await service.get_version(user.id, project_id, version_id)


@router.post(
    "/{project_id}/versions/{version_id}/restore",
    response_model=ProjectOut,
)
async def restore_version(
    project_id: UUID,
    version_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProjectService, Depends(get_project_service)],
) -> ProjectOut:
    """Restore a historical snapshot onto the live canvas."""
    return await service.restore_version(user.id, project_id, version_id)
