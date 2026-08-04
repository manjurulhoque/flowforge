"""Project / Node / Edge persistence.

:meth:`ProjectRepository.save_graph` implements full-graph replacement
semantics: the client owns the authoritative copy of the canvas, so a save
wipes the project's rows and inserts the received snapshot. Version history
layers on top via :class:`~app.models.project.ProjectVersion` snapshots
created by :class:`~app.services.projects.ProjectService`.
"""

from uuid import UUID

from sqlalchemy import delete, func, select

from app.models import Edge, Node, Project
from app.repositories.base import BaseRepository
from app.schemas.common import Graph


class ProjectRepository(BaseRepository[Project]):
    """Data access for :class:`Project` and its graph rows."""

    model = Project

    async def get_with_graph(self, project_id: UUID) -> Project | None:
        """Fetch a project with nodes/edges (selectin-loaded)."""
        return await self.get(project_id)

    async def list_for_owner(
        self,
        user_id: UUID,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[tuple[Project, int, int]]:
        """Return ``(project, node_count, edge_count)`` rows for a user.

        Counts come from correlated subqueries so list views never load
        full graph payloads.
        """
        node_counts = (
            select(Node.project_id, func.count().label("c"))
            .group_by(Node.project_id)
            .subquery()
        )
        edge_counts = (
            select(Edge.project_id, func.count().label("c"))
            .group_by(Edge.project_id)
            .subquery()
        )
        stmt = (
            select(
                Project,
                func.coalesce(node_counts.c.c, 0),
                func.coalesce(edge_counts.c.c, 0),
            )
            .outerjoin(node_counts, node_counts.c.project_id == Project.id)
            .outerjoin(edge_counts, edge_counts.c.project_id == Project.id)
            .where(Project.owner_id == user_id)
            .order_by(Project.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        return [(row[0], int(row[1]), int(row[2])) for row in result.all()]

    async def save_graph(self, project: Project, graph: Graph) -> None:
        """Replace all nodes/edges of ``project`` with ``graph``'s rows."""
        await self._session.execute(delete(Node).where(Node.project_id == project.id))
        await self._session.execute(delete(Edge).where(Edge.project_id == project.id))
        await self._session.flush()

        for node in graph.nodes:
            self._session.add(
                Node(
                    id=node.id,
                    project_id=project.id,
                    type_key=node.data.type_key,
                    label=node.data.label,
                    position_x=node.position.x,
                    position_y=node.position.y,
                    data=node.data.model_dump(by_alias=True, mode="json"),
                )
            )
        for edge in graph.edges:
            self._session.add(
                Edge(
                    id=edge.id,
                    project_id=project.id,
                    source=edge.source,
                    target=edge.target,
                    source_handle=edge.source_handle,
                    target_handle=edge.target_handle,
                    kind=(edge.data or {}).get("kind", "rest"),
                    label=(edge.data or {}).get("label", ""),
                    data=edge.data or {},
                )
            )
        await self._session.flush()

    async def clear_graph(self, project_id: UUID) -> None:
        await self._session.execute(delete(Node).where(Node.project_id == project_id))
        await self._session.execute(delete(Edge).where(Edge.project_id == project_id))
        await self._session.flush()


class EdgeRepository(BaseRepository[Edge]):
    """Data access for individual :class:`Edge` rows."""

    model = Edge


def node_rows_to_graph(nodes: list[Node]) -> list[dict]:
    """Convert ORM node rows back into React Flow node payloads."""
    return [
        {
            "id": n.id,
            "position": {"x": n.position_x, "y": n.position_y},
            "data": n.data,
            "type": "arch",
        }
        for n in nodes
    ]
