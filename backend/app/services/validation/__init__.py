"""Validation service package.

Exposes a stable entry point, :func:`run_validation`, that the API layer
calls. Rules live in :mod:`rules`, the graph model in :mod:`graph`.
"""

from app.schemas.common import Graph
from app.schemas.validation import ValidationResult
from app.services.validation.engine import ValidationEngine

__all__ = ["ValidationEngine", "run_validation"]


def run_validation(graph: Graph) -> ValidationResult:
    """Validate an architecture graph, returning issues + summary."""
    return ValidationEngine().validate(graph)
