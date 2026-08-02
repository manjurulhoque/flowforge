"""Kubernetes manifests exporter.

Emits one ``Deployment`` per node plus a ``Service`` whenever the node
exposes a port. Images resolve through the shared image map so the
generated manifests mirror the Docker Compose exporter.
"""

from app.schemas.common import Graph, GraphNode, NodeConfig
from app.services.exporters.base import Exporter
from app.services.exporters.shared import emit_block, resolve_image, slug


class KubernetesExporter(Exporter):
    format = "k8s"
    mime_type = "text/yaml"

    def export(self, graph: Graph, *, project_name: str) -> str:
        docs: list[str] = []
        project_slug = slug(project_name)

        for node in graph.nodes:
            cfg = node.data.config
            name = slug(node.data.label)
            labels = {"app": name, "flowforge.io/project": project_slug}

            docs.append("---")
            docs.extend(
                emit_block(
                    {
                        "apiVersion": "apps/v1",
                        "kind": "Deployment",
                        "metadata": {"name": name, "labels": labels},
                        "spec": {
                            "replicas": cfg.replicas,
                            "selector": {"matchLabels": {"app": name}},
                            "template": {
                                "metadata": {"labels": labels},
                                "spec": {"containers": [self._container(name, node)]},
                            },
                        },
                    }
                )
            )

            if cfg.port:
                docs.append("---")
                docs.extend(
                    emit_block(
                        {
                            "apiVersion": "v1",
                            "kind": "Service",
                            "metadata": {"name": name, "labels": labels},
                            "spec": {
                                "selector": {"app": name},
                                "ports": [{"port": cfg.port, "targetPort": cfg.port}],
                            },
                        }
                    )
                )

        if not docs:
            return ""
        return "\n".join(docs) + "\n"

    @staticmethod
    def _container(name: str, node: GraphNode) -> dict[str, object]:
        cfg: NodeConfig = node.data.config
        container: dict[str, object] = {
            "name": name,
            "image": resolve_image(node),
        }
        if cfg.port:
            container["ports"] = [{"containerPort": cfg.port}]
        env = [
            {"name": var.key, "value": var.value}
            for var in cfg.env
            if var.key and not var.secret
        ]
        if env:
            container["env"] = env
        if cfg.health_endpoint:
            container["readinessProbe"] = {
                "httpGet": {"path": cfg.health_endpoint, "port": cfg.port or 80},
                "initialDelaySeconds": 5,
                "periodSeconds": 10,
            }
        return container
