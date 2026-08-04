"""Project, Node, Edge and ProjectVersion persistence models.

The graph is persisted relationally: each node/edge is a row, with the
React Flow payload stored as JSONB alongside scalar columns (position,
type) that future features — collaboration, versioning, spatial queries —
depend on.

:class:`ProjectVersion` stores immutable full-graph snapshots for
server-side history (restore / timeline). The live canvas remains in
``nodes`` / ``edges``.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    JSON,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.db.types import GUID

if TYPE_CHECKING:
    from app.models.user import User

JsonType = JSONB().with_variant(JSON(), "sqlite")

PROJECT_STATUSES = ("active", "archived")
NODE_CATEGORIES = (
    "services",
    "databases",
    "messaging",
    "cache",
    "infrastructure",
    "external",
    "custom",
)


class Project(Base, TimestampMixin):
    """An architecture document owned by a user."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    accent: Mapped[str] = mapped_column(String(9), nullable=False, default="#5b6578")

    owner: Mapped["User"] = relationship(back_populates="projects")
    nodes: Mapped[list["Node"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Node.created_at",
    )
    edges: Mapped[list["Edge"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Edge.created_at",
    )
    versions: Mapped[list["ProjectVersion"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="noload",
        order_by="ProjectVersion.version.desc()",
    )


class Node(Base, TimestampMixin):
    """A single architecture node on a project canvas.

    ``id`` mirrors the client-side React Flow node id so graph round-trips
    need no id remapping.
    """

    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True
    )
    type_key: Mapped[str] = mapped_column(String(64), nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    position_x: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    position_y: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    data: Mapped[dict[str, object]] = mapped_column(
        JsonType, nullable=False, default=dict
    )

    project: Mapped[Project] = relationship(back_populates="nodes")

    def __repr__(self):
        return f"Node(id={self.id}, project_id={self.project_id}, type_key={self.type_key}, label={self.label}, position_x={self.position_x}, position_y={self.position_y}, data={self.data}, created_at={self.created_at})"


class Edge(Base, TimestampMixin):
    """A connection between two nodes.

    ``source`` / ``target`` reference ``Node.id`` values (client ids).
    """

    __tablename__ = "edges"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True
    )
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    target: Mapped[str] = mapped_column(String(64), nullable=False)
    source_handle: Mapped[str | None] = mapped_column(String(64), nullable=True)
    target_handle: Mapped[str | None] = mapped_column(String(64), nullable=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False, default="rest")
    label: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    data: Mapped[dict[str, object]] = mapped_column(
        JsonType, nullable=False, default=dict
    )

    project: Mapped[Project] = relationship(back_populates="edges")

    def __repr__(self):
        return f"Edge(id={self.id}, project_id={self.project_id}, source={self.source}, target={self.target}, source_handle={self.source_handle}, target_handle={self.target_handle}, kind={self.kind}, label={self.label}, data={self.data}, created_at={self.created_at})"


class ProjectVersion(Base):
    """Immutable full-graph snapshot for a project.

    Versions are append-only. Restoring creates a *new* version rather than
    rewriting history. Duplicate content hashes are skipped on ordinary
    saves; named checkpoints may still be created explicitly.
    """

    __tablename__ = "project_versions"
    __table_args__ = (
        UniqueConstraint(
            "project_id", "version", name="uq_project_versions_project_version"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("projects.id", ondelete="CASCADE"), index=True, nullable=False
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str | None] = mapped_column(String(200), nullable=True)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    node_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    edge_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    graph: Mapped[dict[str, object]] = mapped_column(JsonType, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    project: Mapped[Project] = relationship(back_populates="versions")

    def __repr__(self):
        return f"ProjectVersion(id={self.id}, project_id={self.project_id}, version={self.version}, label={self.label}, content_hash={self.content_hash}, node_count={self.node_count}, edge_count={self.edge_count}, created_at={self.created_at})"
