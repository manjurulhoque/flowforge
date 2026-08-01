"""Validation schemas.

The issue contract deliberately mirrors — and extends — the frontend
``ValidationIssue`` type: every issue carries severity, a machine-readable
code, a message, a longer description, a suggestion and affected node ids.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Severity = Literal["error", "warning", "info"]


class ValidationIssue(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    code: str
    severity: Severity
    message: str
    description: str = ""
    suggestion: str = ""
    affected_node_ids: list[str] = Field(default_factory=list, alias="affectedNodeIds")
    related_edge_ids: list[str] = Field(default_factory=list, alias="relatedEdgeIds")


class ValidationSummary(BaseModel):
    error_count: int = 0
    warning_count: int = 0
    info_count: int = 0
    valid: bool = True


class ValidationResult(BaseModel):
    issues: list[ValidationIssue] = Field(default_factory=list)
    summary: ValidationSummary = Field(default_factory=ValidationSummary)
