"""Background workers — PLACEHOLDER.

Export jobs (PNG/SVG rasterization), AI generation, simulation and
real-time collaboration all need async workers. They will be implemented
with the task queue of record (Celery + Redis, or arq) once the first
long-running feature lands. Nothing here is wired into ``main.py`` yet.
"""

from typing import Protocol


class JobHandler(Protocol):
    """Contract for a background job function."""

    name: str

    async def run(self, job_id: str, payload: dict) -> None: ...


# ── Roadmap ─────────────────────────────────────────────────────────────
# 1. Choose a queue (arq for async-native, or Celery for ecosystem).
# 2. Register job handlers here (export_job, ai_generation_job,
#    simulation_job, graph_snapshot_job for version history).
# 3. Start a worker process in docker-compose and wire job status to the
#    WebSocket channel.
