"""Validation rules.

Every rule is a self-contained class with a stable ``code``, a default
severity and an ``evaluate`` method returning :class:`ValidationIssue`
instances. Rules are registered with the engine via the
``ValidationEngine.register`` API — adding a new check never touches
existing code.
"""

from abc import ABC, abstractmethod

from app.schemas.validation import Severity, ValidationIssue
from app.services.validation.graph import GraphView


class ValidationRule(ABC):
    """Base class for architecture validation rules."""

    code: str
    severity: Severity = "info"
    message: str = ""
    description: str = ""

    @abstractmethod
    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        """Return issues found in ``graph``."""

    def issue(
        self,
        *,
        affected_node_ids: list[str] | None = None,
        related_edge_ids: list[str] | None = None,
        message: str | None = None,
        suggestion: str = "",
    ) -> ValidationIssue:
        return ValidationIssue(
            code=self.code,
            severity=self.severity,
            message=message or self.message,
            description=self.description,
            suggestion=suggestion,
            affected_node_ids=affected_node_ids or [],
            related_edge_ids=related_edge_ids or [],
        )


# ═══════════════════════════════════════════════════════════════════════
# Rules
# ═══════════════════════════════════════════════════════════════════════


class MissingApiGatewayRule(ValidationRule):
    """Traffic enters services but no gateway fronts them."""

    code = "missing-api-gateway"
    severity: Severity = "warning"
    message = "No API Gateway detected"
    description = (
        "Service nodes exist but no API Gateway is present. Without a gateway, "
        "routing, rate limiting and centralized auth must be reinvented per service."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        if not graph.nodes_by_category("services"):
            return []
        if graph.nodes_of_types("api-gateway", "ingress"):
            return []
        return [
            self.issue(
                affected_node_ids=[n.id for n in graph.nodes_by_category("services")],
                suggestion="Add an API Gateway (or Ingress) in front of your services.",
            )
        ]


class MissingAuthenticationRule(ValidationRule):
    """A gateway exists but no auth service protects it."""

    code = "missing-authentication"
    severity: Severity = "warning"
    message = "No authentication layer detected"
    description = (
        "The architecture exposes services but has no Auth node. Endpoints are "
        "reachable without identity verification."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        has_gateway = bool(graph.nodes_of_types("api-gateway", "ingress"))
        has_services = bool(graph.nodes_by_category("services"))
        has_auth = bool(graph.nodes_of_types("auth"))
        if not (has_gateway or has_services) or has_auth:
            return []
        exposed = [n.id for n in graph.nodes_of_types("api-gateway", "ingress")]
        if not exposed:
            exposed = [n.id for n in graph.nodes_by_category("services")]
        return [
            self.issue(
                affected_node_ids=exposed,
                suggestion="Add an Auth service and wire the gateway to it.",
            )
        ]


class MissingMonitoringRule(ValidationRule):
    """No observability tooling anywhere in the architecture."""

    code = "missing-monitoring"
    severity: Severity = "info"
    message = "No monitoring stack detected"
    description = (
        "Prometheus, Grafana, Loki or Jaeger are absent. Distributed systems need "
        "metrics, logs and traces to be operated reliably."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        if not graph.nodes_by_category("services"):
            return []
        if graph.nodes_of_types("prometheus", "grafana", "loki", "jaeger"):
            return []
        return [
            self.issue(
                affected_node_ids=[n.id for n in graph.nodes_by_category("services")],
                suggestion="Add Prometheus/Grafana for metrics, Loki for logs, Jaeger for traces.",
            )
        ]


class MissingCacheRule(ValidationRule):
    """Hot-path services exist but there is no cache tier."""

    code = "missing-cache"
    severity: Severity = "info"
    message = "No cache tier detected"
    description = (
        "No Redis/cache node found. Frequently read data will hit databases on "
        "every request, increasing latency and load."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        if not graph.nodes_by_category("services"):
            return []
        if graph.nodes_by_category("cache"):
            return []
        return [
            self.issue(
                affected_node_ids=[n.id for n in graph.nodes_by_category("services")],
                suggestion="Add a Redis cache in front of high-read services.",
            )
        ]


class SharedDatabaseRule(ValidationRule):
    """More than ``threshold`` services depend on a single database."""

    code = "shared-database"
    severity: Severity = "warning"
    message = "Database is shared by many services"
    description = (
        "A single database backing several services creates hidden coupling: schema "
        "changes and contention ripple across service boundaries."
    )
    threshold = 3

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        for node in graph.nodes_by_category("databases"):
            consumers = [
                src
                for src in graph.incoming(node.id)
                if graph.nodes.get(src) and graph.nodes[src].is_service
            ]
            if len(consumers) >= self.threshold:
                issues.append(
                    self.issue(
                        affected_node_ids=[node.id, *consumers],
                        related_edge_ids=[
                            e.id
                            for c in consumers
                            for e in graph.edges_between(c, node.id)
                        ],
                        suggestion=(
                            "Consider a database-per-service pattern, or split "
                            "the shared store into bounded contexts."
                        ),
                    )
                )
        return issues


class PublicDatabaseRule(ValidationRule):
    """A database is reachable directly from an external/edge node."""

    code = "public-database"
    severity: Severity = "error"
    message = "Database is exposed directly"
    description = (
        "A database is connected to an external boundary node (external API, "
        "ingress or load balancer). Databases must never be reachable from "
        "untrusted surfaces."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        boundary = ("external", "infrastructure")
        for node in graph.nodes_by_category("databases"):
            offenders = [src for src in graph.incoming(node.id) if graph.nodes.get(src)]
            exposed_by = [
                src
                for src in offenders
                if graph.nodes[src].category in boundary
                or graph.nodes[src].type_key in ("ingress", "load-balancer")
            ]
            if exposed_by:
                issues.append(
                    self.issue(
                        affected_node_ids=[node.id, *exposed_by],
                        suggestion=(
                            "Move the database behind a service layer; never connect "
                            "it to ingress or external APIs."
                        ),
                    )
                )
        return issues


class CircularDependencyRule(ValidationRule):
    """Service-level cycles indicate tight coupling."""

    code = "circular-dependency"
    severity: Severity = "error"
    message = "Circular dependency detected"
    description = (
        "Services form a cycle (A → B → A). This blocks independent deployment, "
        "testing and scaling of the involved services."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        cycles = graph.find_cycles()
        issues: list[ValidationIssue] = []
        for cycle in cycles:
            service_ids = [nid for nid in cycle if graph.nodes[nid].is_service]
            if not service_ids:
                continue
            issues.append(
                self.issue(
                    affected_node_ids=cycle,
                    suggestion=(
                        "Break the cycle: extract a shared dependency, introduce an "
                        "event bus, or invert the call direction."
                    ),
                )
            )
        return issues


class SingleKafkaBrokerRule(ValidationRule):
    """Kafka in production needs more than one broker."""

    code = "single-kafka-broker"
    severity: Severity = "warning"
    message = "Kafka cluster has a single broker"
    description = (
        "A single Kafka broker is a single point of failure and cannot achieve "
        "the replication and throughput Kafka promises."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        kafka_nodes = graph.nodes_of_types("kafka")
        if len(kafka_nodes) > 1:
            return []
        if len(kafka_nodes) == 0:
            return []
        return [
            self.issue(
                affected_node_ids=[n.id for n in kafka_nodes],
                suggestion="Run at least three Kafka brokers for production.",
            )
        ]


class IsolatedNodeRule(ValidationRule):
    """Nodes that participate in no edges."""

    code = "isolated-node"
    severity: Severity = "warning"
    message = "Node is not connected to anything"
    description = (
        "This node has no incoming or outgoing connections. It has no role in the "
        "architecture and may be dead weight or a mistake."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        if len(graph.nodes) < 2:
            return []
        issues: list[ValidationIssue] = []
        for node_id, node in graph.nodes.items():
            if not graph.connected(node_id):
                issues.append(
                    self.issue(
                        affected_node_ids=[node_id],
                        suggestion=(
                            f'Wire "{node.label}" into the graph or remove it.'
                        ),
                    )
                )
        return issues


class SingleReplicaRule(ValidationRule):
    """Services running a single replica have no HA."""

    code = "single-replica"
    severity: Severity = "info"
    message = "Service runs a single replica"
    description = (
        "A single replica offers no redundancy: any failure takes the service down "
        "and prevents zero-downtime deploys."
    )

    def evaluate(self, graph: GraphView) -> list[ValidationIssue]:
        issues: list[ValidationIssue] = []
        for node in graph.nodes_by_category("services"):
            if node.replicas < 2:
                issues.append(
                    self.issue(
                        affected_node_ids=[node.id],
                        suggestion=(
                            f'Run at least 2 replicas of "{node.label}" for high availability.'
                        ),
                    )
                )
        return issues


DEFAULT_RULES: tuple[type[ValidationRule], ...] = (
    MissingApiGatewayRule,
    MissingAuthenticationRule,
    MissingMonitoringRule,
    MissingCacheRule,
    SharedDatabaseRule,
    PublicDatabaseRule,
    CircularDependencyRule,
    SingleKafkaBrokerRule,
    IsolatedNodeRule,
    SingleReplicaRule,
)
