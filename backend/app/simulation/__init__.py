"""Simulation — INTERFACE ONLY.

Defines the message contract between the editor and the (future) simulation
engine. The simulation runs as a background worker publishing incremental
results over the project WebSocket channel; the frontend renders them on
the canvas as animated traffic and latency heatmaps.
"""

from typing import Literal, Protocol

from app.schemas.common import Graph

SimulationMode = Literal["request", "latency", "failure", "load"]


class SimulationConfig(Protocol):
    mode: SimulationMode
    duration_seconds: int
    concurrency: int
    failure_nodes: list[str] | None  # failure injection targets
    baseline_latency_ms: int


class SimulationEvent(Protocol):
    """One incremental result frame, pushed over WebSocket."""

    type: Literal["start", "tick", "failure", "latency", "finish", "error"]
    timestamp: float
    data: dict


class SimulationEngine(Protocol):
    """A simulation backend (locust, custom async engine, …)."""

    async def run(self, graph: Graph, config: SimulationConfig) -> None:
        """Execute a simulation; emit SimulationEvents via callback."""


# ── Roadmap ─────────────────────────────────────────────────────────────
# 1. Implement ``SimulationEngine`` in ``app/simulation/engine.py``.
# 2. Wire ``POST /api/simulation/start`` → enqueue job in ``app/workers/``.
# 3. Stream ``SimulationEvent`` frames over ``/ws/projects/{id}``.
