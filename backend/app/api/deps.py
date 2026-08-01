"""Service-layer dependency constructors for routers.

Each factory builds a service with its concrete repository dependencies.
Swapping a repository for a fake in tests is as simple as overriding
these dependencies.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.repositories import ProjectRepository, RefreshTokenRepository, UserRepository
from app.services import AuthService, ExportService, ProjectService


def get_auth_service(
    session: Annotated[AsyncSession, Depends(get_db)],
) -> AuthService:
    return AuthService(
        session,
        users=UserRepository(session),
        tokens=RefreshTokenRepository(session),
    )


def get_project_service(
    session: Annotated[AsyncSession, Depends(get_db)],
) -> ProjectService:
    return ProjectService(session, projects=ProjectRepository(session))


def get_export_service(
    session: Annotated[AsyncSession, Depends(get_db)],
) -> ExportService:
    return ExportService(session)
