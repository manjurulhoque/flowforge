"""Graph wire schemas.

These mirror the frontend ``@xyflow/react`` payloads. Field aliases are
camelCase (matching the React Flow JSON), ``populate_by_name`` allows both
spellings, and ``extra="allow"`` lets unknown React Flow fields (``selected``,
``dragging``, ``measured``…) round-trip untouched.
"""

from pydantic import BaseModel, ConfigDict, Field


class GraphConfig(BaseModel):
    """Graph-level export/validation configuration."""

    model_config = ConfigDict(extra="allow")


class Position(BaseModel):
    x: float
    y: float


class EnvVar(BaseModel):
    id: str
    key: str
    value: str = ""
    secret: bool = False


class NodeConfig(BaseModel):
    """Deployment-oriented configuration for a node."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    language: str = ""
    framework: str = ""
    port: int | None = None
    replicas: int = 1
    cpu: str = ""
    memory: str = ""
    health_endpoint: str | None = Field(default=None, alias="healthEndpoint")
    autoscaling: bool = False
    min_replicas: int | None = Field(default=None, alias="minReplicas")
    max_replicas: int | None = Field(default=None, alias="maxReplicas")
    env: list[EnvVar] = Field(default_factory=list)


class ArchNodeData(BaseModel):
    """The payload stored on every node.

    ``extra="allow"`` guarantees forward compatibility: new client fields
    survive a round-trip through the API without schema changes.
    """

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    label: str
    type_key: str = Field(alias="typeKey")
    category: str = "custom"
    description: str = ""
    status: str = "unknown"
    tags: list[str] = Field(default_factory=list)
    color: str = ""
    icon: str = ""
    config: NodeConfig = Field(default_factory=NodeConfig)
    metadata: dict[str, object] = Field(default_factory=dict)
    has_issue: bool | None = Field(default=None, alias="hasIssue")


class GraphNode(BaseModel):
    """A React Flow node."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: str
    position: Position
    data: ArchNodeData
    type: str | None = "arch"


class GraphEdge(BaseModel):
    """A React Flow edge."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: str
    source: str
    target: str
    source_handle: str | None = Field(default=None, alias="sourceHandle")
    target_handle: str | None = Field(default=None, alias="targetHandle")
    type: str | None = "arch"
    data: dict[str, object] | None = None


class Graph(BaseModel):
    """The full canvas payload."""

    model_config = ConfigDict(extra="allow")

    nodes: list[GraphNode] = Field(default_factory=list)
    edges: list[GraphEdge] = Field(default_factory=list)

    def dump(self) -> dict[str, object]:
        """Serialize to camelCase JSON (the client contract)."""
        return self.model_dump(by_alias=True, mode="json")
