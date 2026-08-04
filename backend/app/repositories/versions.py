"""Project version history persistence."""

from uuid import UUID

from sqlalchemy import func, select

from app.models import ProjectVersion
from app.repositories.base import BaseRepository


class VersionRepository(BaseRepository[ProjectVersion]):
    """Data access for :class:`ProjectVersion` rows."""

    model = ProjectVersion

    async def list_for_project(
        self,
        project_id: UUID,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[ProjectVersion]:
        stmt = (
            select(ProjectVersion)
            .where(ProjectVersion.project_id == project_id)
            .order_by(ProjectVersion.version.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def count_for_project(self, project_id: UUID) -> int:
        stmt = select(func.count()).where(ProjectVersion.project_id == project_id)
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

    async def get_for_project(
        self, project_id: UUID, version_id: UUID
    ) -> ProjectVersion | None:
        stmt = select(ProjectVersion).where(
            ProjectVersion.id == version_id,
            ProjectVersion.project_id == project_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def latest(self, project_id: UUID) -> ProjectVersion | None:
        stmt = (
            select(ProjectVersion)
            .where(ProjectVersion.project_id == project_id)
            .order_by(ProjectVersion.version.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def next_version_number(self, project_id: UUID) -> int:
        stmt = select(func.coalesce(func.max(ProjectVersion.version), 0)).where(
            ProjectVersion.project_id == project_id
        )
        result = await self._session.execute(stmt)
        return int(result.scalar_one()) + 1
