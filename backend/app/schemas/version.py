"""Project version history schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import Graph


class VersionCreate(BaseModel):
    """Named checkpoint of the project's current live graph."""

    label: str | None = Field(default=None, max_length=200)


class VersionSummaryOut(BaseModel):
    """Version metadata without the full graph payload."""

    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    version: int
    label: str | None = None
    node_count: int = Field(alias="nodeCount")
    edge_count: int = Field(alias="edgeCount")
    content_hash: str = Field(alias="contentHash")
    created_by: UUID | None = Field(default=None, alias="createdBy")
    created_at: datetime = Field(alias="createdAt")


class VersionOut(VersionSummaryOut):
    """A version including its full graph snapshot."""

    graph: Graph


class VersionListOut(BaseModel):
    items: list[VersionSummaryOut]
    total: int
