"""AI architecture assistance — INTERFACE ONLY.

This package defines the contracts for the upcoming AI features. Nothing
here is implemented yet; the interface is deliberately small and graph
schema stays the source of truth, so adding a provider later touches only
``app/ai/providers/``.
"""

from abc import ABC, abstractmethod
from typing import Protocol

from app.schemas.common import Graph
from app.schemas.validation import ValidationResult


class ArchitectureGenerationRequest(Protocol):
    """User intent for generating an architecture."""

    prompt: str
    constraints: dict[str, str] | None = None


class ArchitectureReview(Protocol):
    """Result of an AI architecture review."""

    summary: str
    strengths: list[str]
    risks: list[str]
    suggestions: list[str]


class AiProvider(ABC):
    """Provider-agnostic AI backend. Implementations (OpenAI, Anthropic…)
    must be stateless and stream progress through callbacks."""

    name: str

    @abstractmethod
    async def generate_architecture(
        self, request: ArchitectureGenerationRequest
    ) -> Graph:
        """Translate a natural-language prompt into a graph."""

    @abstractmethod
    async def review_architecture(self, graph: Graph) -> ArchitectureReview:
        """Human-readable review of an existing architecture."""

    @abstractmethod
    async def suggest_optimizations(
        self, graph: Graph, issues: ValidationResult
    ) -> list[str]:
        """Targeted, actionable optimization suggestions."""

    @abstractmethod
    async def generate_documentation(self, graph: Graph) -> str:
        """Markdown documentation describing the architecture."""


# ── Roadmap ─────────────────────────────────────────────────────────────
# 1. Implement a provider (e.g. OpenAI-compatible chat completions).
# 2. Register it via ``app/ai/registry.py``.
# 3. Add ``POST /api/ai/generate``, ``POST /api/ai/review`` endpoints that
#    enqueue background jobs in ``app/workers/`` and stream progress over
#    the existing WebSocket channel.
