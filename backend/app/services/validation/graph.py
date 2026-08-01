"""Graph domain model used by the validation engine.

A lightweight, dependency-free view of the architecture graph so rules
only reason about semantics (categories, connections) — never about
React Flow serialization.
"""

from dataclasses import dataclass, field

from app.schemas.common import ArchNodeData, Graph


@dataclass(frozen=True)
class NodeView:
    """Semantic view of a graph node."""

    id: str
    type_key: str
    category: str
    label: str
    status: str
    config: dict = field(default_factory=dict)

    @classmethod
    def from_data(cls, node_id: str, data: ArchNodeData) -> "NodeView":
        return cls(
            id=node_id,
            type_key=data.type_key,
            category=data.category,
            label=data.label,
            status=data.status,
            config=data.config.model_dump() if data.config else {},
        )

    @property
    def is_database(self) -> bool:
        return self.category == "databases"

    @property
    def is_cache(self) -> bool:
        return self.category == "cache"

    @property
    def is_messaging(self) -> bool:
        return self.category == "messaging"

    @property
    def is_service(self) -> bool:
        return self.category == "services"

    @property
    def is_external(self) -> bool:
        return self.category == "external"

    @property
    def is_infrastructure(self) -> bool:
        return self.category == "infrastructure"

    @property
    def replicas(self) -> int:
        return int(self.config.get("replicas", 1) or 1)


@dataclass(frozen=True)
class EdgeView:
    id: str
    source: str
    target: str
    kind: str


class GraphView:
    """Adjacency-indexed graph for rule evaluation."""

    def __init__(self, graph: Graph):
        self.nodes: dict[str, NodeView] = {
            n.id: NodeView.from_data(n.id, n.data) for n in graph.nodes
        }
        self.edges: list[EdgeView] = [
            EdgeView(
                id=e.id,
                source=e.source,
                target=e.target,
                kind=(e.data or {}).get("kind", "rest"),
            )
            for e in graph.edges
            if e.source in self.nodes and e.target in self.nodes
        ]
        self._outgoing: dict[str, list[str]] = {nid: [] for nid in self.nodes}
        self._incoming: dict[str, list[str]] = {nid: [] for nid in self.nodes}
        for edge in self.edges:
            self._outgoing[edge.source].append(edge.target)
            self._incoming[edge.target].append(edge.source)

    # ── queries ─────────────────────────────────────────────────────────
    def outgoing(self, node_id: str) -> list[str]:
        return self._outgoing.get(node_id, [])

    def incoming(self, node_id: str) -> list[str]:
        return self._incoming.get(node_id, [])

    def connected(self, node_id: str) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for neighbor in [*self.incoming(node_id), *self.outgoing(node_id)]:
            if neighbor not in seen:
                seen.add(neighbor)
                result.append(neighbor)
        return result

    def nodes_by_category(self, category: str) -> list[NodeView]:
        return [n for n in self.nodes.values() if n.category == category]

    def nodes_of_types(self, *type_keys: str) -> list[NodeView]:
        return [n for n in self.nodes.values() if n.type_key in type_keys]

    def edges_between(self, source: str, target: str) -> list[EdgeView]:
        return [e for e in self.edges if e.source == source and e.target == target]

    # ── cycle detection ─────────────────────────────────────────────────
    def find_cycles(self) -> list[list[str]]:
        """Return elementary cycles as ordered node-id lists (DFS-based)."""
        cycles: list[list[str]] = []
        visited: set[str] = set()
        path: list[str] = []
        path_index: dict[str, int] = {}

        def dfs(node: str) -> None:
            path.append(node)
            path_index[node] = len(path) - 1
            visited.add(node)

            for neighbor in self.outgoing(node):
                if neighbor in path_index:
                    cycle = path[path_index[neighbor] :]
                    cycles.append(cycle)
                elif neighbor not in visited:
                    dfs(neighbor)

            path.pop()
            del path_index[node]

        for node_id in self.nodes:
            if node_id not in visited:
                dfs(node_id)
        return cycles

    def is_cyclic(self) -> bool:
        return bool(self.find_cycles())
