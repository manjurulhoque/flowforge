"""Project service — project CRUD, graph persistence, version history.

This is where all project business rules live (ownership checks, default
values, assembly of API payloads). The router stays thin.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models import Project, ProjectVersion
from app.repositories import ProjectRepository, VersionRepository
from app.schemas.common import Graph
from app.schemas.project import (
    ProjectCreate,
    ProjectOut,
    ProjectSummaryOut,
    ProjectUpdate,
)
from app.schemas.version import (
    VersionCreate,
    VersionListOut,
    VersionOut,
    VersionSummaryOut,
)
from app.services.graph_assembly import graph_from_rows, project_out, project_summary
from app.services.graph_hash import graph_content_hash

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
        self,
        session: AsyncSession,
        projects: ProjectRepository | None = None,
        versions: VersionRepository | None = None,
    ):
        self._session = session
        self.projects = projects or ProjectRepository(session)
        self.versions = versions or VersionRepository(session)

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
        await self._snapshot_if_changed(project, user_id, graph, label=None)
        await self._session.commit()
        # The identity-mapped instance still holds the pre-save collections;
        # refresh them so assembly reads the persisted rows.
        await self._session.refresh(project, attribute_names=["nodes", "edges"])
        return project_out(project, len(graph.nodes), len(graph.edges))

    # ── version history ─────────────────────────────────────────────────

    async def list_versions(
        self, user_id: UUID, project_id: UUID
    ) -> VersionListOut:
        await self._owned_or_404(user_id, project_id)
        items = await self.versions.list_for_project(project_id)
        total = await self.versions.count_for_project(project_id)
        return VersionListOut(
            items=[_version_summary(v) for v in items],
            total=total,
        )

    async def get_version(
        self, user_id: UUID, project_id: UUID, version_id: UUID
    ) -> VersionOut:
        await self._owned_or_404(user_id, project_id)
        version = await self.versions.get_for_project(project_id, version_id)
        if version is None:
            raise NotFoundError(message="Version not found")
        return _version_out(version)

    async def create_checkpoint(
        self,
        user_id: UUID,
        project_id: UUID,
        payload: VersionCreate,
    ) -> VersionOut:
        """Snapshot the live graph with an optional label.

        Named checkpoints are always created, even when the content hash
        matches the latest version.
        """
        project = await self._owned_or_404(user_id, project_id)
        graph = graph_from_rows(project.nodes, project.edges)
        label = payload.label.strip() if payload.label else None
        version = await self._create_snapshot(
            project, user_id, graph, label=label, force=True
        )
        assert version is not None
        await self._session.commit()
        return _version_out(version)

    async def restore_version(
        self, user_id: UUID, project_id: UUID, version_id: UUID
    ) -> ProjectOut:
        """Replace the live graph with a historical snapshot.

        Appends a new version labelled ``Restored from vN`` so history
        stays append-only.
        """
        project = await self._owned_or_404(user_id, project_id)
        source = await self.versions.get_for_project(project_id, version_id)
        if source is None:
            raise NotFoundError(message="Version not found")

        graph = Graph.model_validate(source.graph)
        await self.projects.save_graph(project, graph)
        await self._create_snapshot(
            project,
            user_id,
            graph,
            label=f"Restored from v{source.version}",
            force=True,
        )
        await self._session.commit()
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

    async def _snapshot_if_changed(
        self,
        project: Project,
        user_id: UUID,
        graph: Graph,
        *,
        label: str | None,
    ) -> ProjectVersion | None:
        return await self._create_snapshot(
            project, user_id, graph, label=label, force=False
        )

    async def _create_snapshot(
        self,
        project: Project,
        user_id: UUID,
        graph: Graph,
        *,
        label: str | None,
        force: bool,
    ) -> ProjectVersion | None:
        content_hash = graph_content_hash(graph)
        if not force:
            latest = await self.versions.latest(project.id)
            if latest is not None and latest.content_hash == content_hash:
                return None

        version = await self.versions.add(
            ProjectVersion(
                project_id=project.id,
                created_by=user_id,
                version=await self.versions.next_version_number(project.id),
                label=label,
                content_hash=content_hash,
                node_count=len(graph.nodes),
                edge_count=len(graph.edges),
                graph=graph.dump(),
            )
        )
        return version


def _version_summary(version: ProjectVersion) -> VersionSummaryOut:
    return VersionSummaryOut(
        id=version.id,
        version=version.version,
        label=version.label,
        node_count=version.node_count,
        edge_count=version.edge_count,
        content_hash=version.content_hash,
        created_by=version.created_by,
        created_at=version.created_at,
    )


def _version_out(version: ProjectVersion) -> VersionOut:
    return VersionOut(
        id=version.id,
        version=version.version,
        label=version.label,
        node_count=version.node_count,
        edge_count=version.edge_count,
        content_hash=version.content_hash,
        created_by=version.created_by,
        created_at=version.created_at,
        graph=Graph.model_validate(version.graph),
    )
