"""Project service — project CRUD, graph persistence and assembly.

This is where all project business rules live (ownership checks, default
values, assembly of API payloads). The router stays thin.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models import Project
from app.repositories import ProjectRepository
from app.schemas.common import Graph
from app.schemas.project import (
    ProjectCreate,
    ProjectOut,
    ProjectSummaryOut,
    ProjectUpdate,
)
from app.services.graph_assembly import project_out, project_summary

ACCENTS = (
    "#5b6578",
    "#6d8a72",
    "#94856f",
    "#7d6e82",
    "#6b7c94",
    "#8e7887",
)


class ProjectService:
    """Business operations over projects and their graphs."""

    def __init__(
        self, session: AsyncSession, projects: ProjectRepository | None = None
    ):
        self._session = session
        self.projects = projects or ProjectRepository(session)

    # ── queries ─────────────────────────────────────────────────────────

    async def list_for_user(self, user_id: UUID) -> list[ProjectSummaryOut]:
        rows = await self.projects.list_for_owner(user_id)
        return [project_summary(p, nodes, edges) for p, nodes, edges in rows]

    async def get_for_user(self, user_id: UUID, project_id: UUID) -> ProjectOut:
        project = await self._owned_or_404(user_id, project_id)
        return project_out(project, len(project.nodes), len(project.edges))

    # ── mutations ───────────────────────────────────────────────────────

    async def create(
        self,
        user_id: UUID,
        payload: ProjectCreate,
    ) -> ProjectOut:
        project = await self.projects.add(
            Project(
                owner_id=user_id,
                name=payload.name.strip(),
                description=payload.description.strip(),
                status="active",
                accent=ACCENTS[(await self._project_count(user_id)) % len(ACCENTS)],
            )
        )
        await self._session.commit()
        # The new project's relationships were never loaded; refresh them so
        # assembly can read ``nodes``/``edges`` without lazy IO.
        await self._session.refresh(project, attribute_names=["nodes", "edges"])
        return project_out(project, len(project.nodes), len(project.edges))

    async def update(
        self,
        user_id: UUID,
        project_id: UUID,
        payload: ProjectUpdate,
    ) -> ProjectOut:
        project = await self._owned_or_404(user_id, project_id)
        changes = payload.model_dump(exclude_unset=True, exclude_none=True)
        for field, value in changes.items():
            setattr(project, field, value)
        await self._session.flush()
        await self._session.commit()
        return project_out(project, len(project.nodes), len(project.edges))

    async def delete(self, user_id: UUID, project_id: UUID) -> None:
        project = await self._owned_or_404(user_id, project_id)
        await self.projects.delete(project)
        await self._session.commit()

    async def save_graph(
        self,
        user_id: UUID,
        project_id: UUID,
        graph: Graph,
    ) -> ProjectOut:
        project = await self._owned_or_404(user_id, project_id)
        await self.projects.save_graph(project, graph)
        await self._session.commit()
        # The identity-mapped instance still holds the pre-save collections;
        # refresh them so assembly reads the persisted rows.
        await self._session.refresh(project, attribute_names=["nodes", "edges"])
        return project_out(project, len(graph.nodes), len(graph.edges))

    # ── helpers ─────────────────────────────────────────────────────────

    async def _owned_or_404(self, user_id: UUID, project_id: UUID) -> Project:
        project = await self.projects.get_with_graph(project_id)
        if project is None or project.owner_id != user_id:
            # Do not reveal whether the project exists.
            raise NotFoundError(message="Project not found")
        return project

    async def _project_count(self, user_id: UUID) -> int:
        rows = await self.projects.list_for_owner(user_id, limit=1_000)
        return len(rows)
