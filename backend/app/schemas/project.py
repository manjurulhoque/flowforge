"""Project schemas.

Instances are assembled in the service layer (never directly from ORM
objects) because ``node_count`` / ``edge_count`` derive from the graph
rows. Field aliases are camelCase to match the frontend contract.
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from app.schemas.common import Graph
from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=10_000)


class ProjectUpdate(BaseModel):
    """All fields optional — only provided fields are patched."""

    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=10_000)
    status: Literal["active", "archived"] | None = None
    accent: str | None = Field(default=None, max_length=9)


class ProjectSummaryOut(BaseModel):
    """A project without its graph payload (list views)."""

    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    name: str
    description: str
    node_count: int = Field(alias="nodeCount")
    edge_count: int = Field(alias="edgeCount")
    status: str
    accent: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class ProjectOut(ProjectSummaryOut):
    """A project including its full graph."""

    graph: Graph


class ProjectListOut(BaseModel):
    items: list[ProjectSummaryOut]
    total: int
