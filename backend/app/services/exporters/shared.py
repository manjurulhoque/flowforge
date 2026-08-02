"""Shared helpers for exporters: image resolution, slugs, YAML emission.

The image maps are the single source of truth shared by the Docker
Compose, Kubernetes and Terraform exporters so generated artifacts stay
consistent across formats.
"""

import re

from app.schemas.common import Graph, GraphNode

# type_key → (image, category)
IMAGE_MAP: dict[str, tuple[str, str]] = {
    "postgresql": ("postgres:16-alpine", "database"),
    "mysql": ("mysql:8.4", "database"),
    "mongodb": ("mongo:7", "database"),
    "cassandra": ("cassandra:4.1", "database"),
    "redis": ("redis:7-alpine", "cache"),
    "kafka": ("bitnami/kafka:3.6", "messaging"),
    "rabbitmq": ("rabbitmq:3-management", "messaging"),
    "nats": ("nats:2.10", "messaging"),
    "api-gateway": ("nginx:1.27-alpine", "services"),
    "load-balancer": ("nginx:1.27-alpine", "infrastructure"),
    "prometheus": ("prom/prometheus:v2.53.0", "infrastructure"),
    "grafana": ("grafana/grafana:11.1.0", "infrastructure"),
    "loki": ("grafana/loki:3.1.0", "infrastructure"),
    "jaeger": ("jaegertracing/all-in-one:1.57", "infrastructure"),
}

FRAMEWORK_IMAGES = {
    "python": "python:3.13-slim",
    "fastapi": "python:3.13-slim",
    "django": "python:3.13-slim",
    "node": "node:20-alpine",
    "nextjs": "node:20-alpine",
    "nestjs": "node:20-alpine",
    "express": "node:20-alpine",
    "go": "golang:1.22-alpine",
    "spring": "eclipse-temurin:21-jre",
    "java": "eclipse-temurin:21-jre",
}


def resolve_image(node: GraphNode) -> str:
    """Pick the container image for a node (infra map, else framework)."""
    cfg = node.data.config
    framework = (cfg.framework or "").lower()
    image = IMAGE_MAP.get(node.data.type_key)
    if image is not None:
        return image[0]
    return FRAMEWORK_IMAGES.get(framework, "node:20-alpine")


def slug(label: str) -> str:
    """Turn a human label into a safe k8s/compose/terraform identifier."""
    out = "".join(c if c.isalnum() else "-" for c in label.lower()).strip("-")
    return out or "service"


def label_of(graph: Graph, node_id: str) -> str:
    """Slug of the node with ``node_id`` (empty string if unknown)."""
    for node in graph.nodes:
        if node.id == node_id:
            return slug(node.data.label)
    return ""


def scalar(value: object) -> str:
    """Render a YAML scalar, quoting only when necessary."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if value is None:
        return "null"
    text = str(value)
    if _safe_plain(text):
        return text
    return f'"{text}"'


_SAFE_PLAIN = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9_./\-]*$")
_YAML_RESERVED = {"true", "false", "null", "yes", "no", "on", "off", "~"}


def _safe_plain(text: str) -> bool:
    """True when ``text`` can be emitted as an unquoted YAML scalar."""
    return (
        bool(text)
        and bool(_SAFE_PLAIN.match(text))
        and text.lower() not in _YAML_RESERVED
    )


def emit_block(mapping: dict[str, object], indent: int = 0) -> list[str]:
    """Emit ``mapping`` as block-style YAML lines (keys unquoted)."""
    lines: list[str] = []
    pad = "  " * indent
    for key, value in mapping.items():
        if isinstance(value, dict):
            if not value:
                lines.append(f"{pad}{key}: {{}}")
            else:
                lines.append(f"{pad}{key}:")
                lines.extend(emit_block(value, indent + 1))
        elif isinstance(value, list):
            if not value:
                lines.append(f"{pad}{key}: []")
            else:
                lines.append(f"{pad}{key}:")
                for item in value:
                    if isinstance(item, dict):
                        lines.append(f"{'  ' * (indent + 1)}-")
                        lines.extend(emit_block(item, indent + 2))
                    else:
                        lines.append(f"{'  ' * (indent + 1)}- {scalar(item)}")
        else:
            lines.append(f"{pad}{key}: {scalar(value)}")
    return lines
