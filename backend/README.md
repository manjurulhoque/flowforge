# FlowForge Backend

FastAPI + SQLAlchemy 2.0 (async) + Alembic + PostgreSQL service for
[FlowForge](../README.md) — the visual microservice architecture designer.

## Layout

```
backend/
├── app/
│   ├── api/           HTTP routers (auth, projects, validation, export)
│   ├── core/          settings, security (JWT), database, redis
│   ├── models/        SQLAlchemy ORM models
│   ├── schemas/       Pydantic v2 schemas + camelCase aliases
│   ├── services/      business logic (auth, projects, validation, export)
│   └── repositories/  data access layer (SQLAlchemy async)
├── migrations/        Alembic revision history
├── tests/             pytest suite (in-memory SQLite, 41 tests)
└── pyproject.toml     deps + ruff + pytest config
```

## Run

```bash
python3 -m venv venv
venv/bin/pip install -e ".[dev]"
venv/bin/python -m alembic upgrade head          # PostgreSQL or SQLite
venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

With [uv](https://docs.astral.sh/uv/) installed: `uv sync`, `uv run alembic
upgrade head`, `uv run uvicorn app.main:app --reload --port 8000`.

Without Docker, use SQLite: `DATABASE_URL="sqlite+aiosqlite:///./flowforge.db"`.

Interactive docs at http://localhost:8000/docs.
