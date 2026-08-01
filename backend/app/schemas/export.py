"""Export schemas."""

from typing import Literal

from app.schemas.common import Graph
from pydantic import BaseModel

ExportFormat = Literal["json", "mermaid", "docker", "drawio", "png", "svg"]


class ExportRequest(BaseModel):
    format: ExportFormat
    graph: Graph


class ExportResult(BaseModel):
    format: str
    content: str
    filename: str
    mime_type: str = "text/plain"
