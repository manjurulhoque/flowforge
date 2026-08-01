"""Shared helpers for converting ORM graph rows into API payloads."""

from app.models import Edge, Node, Project
from app.schemas.common import Graph
from app.schemas.project import ProjectOut, ProjectSummaryOut


def graph_from_rows(nodes: list[Node], edges: list[Edge]) -> Graph:
    """Build an API :class:`Graph` from ORM rows (camelCase, arch types)."""
    return Graph(
        nodes=[
            {
                "id": n.id,
                "position": {"x": n.position_x, "y": n.position_y},
                "data": n.data,
                "type": "arch",
            }
            for n in nodes
        ],
        edges=[
            {
                "id": e.id,
                "source": e.source,
                "target": e.target,
                "sourceHandle": e.source_handle,
                "targetHandle": e.target_handle,
                "type": "arch",
                "data": e.data,
            }
            for e in edges
        ],
    )


def project_out(project: Project, node_count: int, edge_count: int) -> ProjectOut:
    """Assemble a full :class:`ProjectOut` including the graph payload."""
    return ProjectOut(
        id=project.id,
        name=project.name,
        description=project.description,
        node_count=node_count,
        edge_count=edge_count,
        status=project.status,
        accent=project.accent,
        created_at=project.created_at,
        updated_at=project.updated_at,
        graph=graph_from_rows(project.nodes, project.edges),
    )


def project_summary(
    project: Project, node_count: int, edge_count: int
) -> ProjectSummaryOut:
    return ProjectSummaryOut(
        id=project.id,
        name=project.name,
        description=project.description,
        node_count=node_count,
        edge_count=edge_count,
        status=project.status,
        accent=project.accent,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )
