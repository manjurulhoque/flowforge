"""Validation engine.

Orchestrates rule execution over a graph and aggregates results. Rules are
instantiated once and cached; the engine is cheap to construct per-request
(no shared mutable state), which keeps it safe to run in parallel.
"""

from app.schemas.common import Graph
from app.schemas.validation import ValidationIssue, ValidationResult, ValidationSummary
from app.services.validation.graph import GraphView
from app.services.validation.rules import DEFAULT_RULES, ValidationRule

_SEVERITY_RANK = {"error": 0, "warning": 1, "info": 2}


class ValidationEngine:
    """Runs registered rules against an architecture graph."""

    def __init__(self, rule_classes: tuple[type[ValidationRule], ...] = DEFAULT_RULES):
        self._rules: list[ValidationRule] = [cls() for cls in rule_classes]

    def validate(self, graph: Graph) -> ValidationResult:
        """Evaluate every rule and return aggregated, sorted issues."""
        view = GraphView(graph)
        issues: list[ValidationIssue] = []
        for rule in self._rules:
            issues.extend(rule.evaluate(view))

        issues.sort(key=lambda i: _SEVERITY_RANK.get(i.severity, 3))

        summary = ValidationSummary(
            error_count=sum(1 for i in issues if i.severity == "error"),
            warning_count=sum(1 for i in issues if i.severity == "warning"),
            info_count=sum(1 for i in issues if i.severity == "info"),
            valid=not any(i.severity == "error" for i in issues),
        )
        return ValidationResult(issues=issues, summary=summary)

    @property
    def rule_codes(self) -> list[str]:
        return [rule.code for rule in self._rules]


# Convenience singleton — the engine holds no state between calls.
default_engine = ValidationEngine()
