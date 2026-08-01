.PHONY: infra-up infra-down backend-install backend-dev backend-migrate backend-format backend-lint backend-test backend-check frontend-install frontend-dev typecheck build

# ── Infrastructure ──────────────────────────────────────────────────────
infra-up:
	docker-compose up -d postgres redis

infra-down:
	docker-compose down

# ── Backend ─────────────────────────────────────────────────────────────
# All backend commands run against the pip-managed venv at backend/venv.
# The project requires Python >=3.13, so prefer python3.13 when present.
PY ?= venv/bin/python
PYTHON ?= $(shell command -v python3.13 >/dev/null 2>&1 && echo python3.13 || echo python3)

backend-install:
	cd backend && $(PYTHON) -m venv venv && venv/bin/pip install -e ".[dev]"

backend-dev:
	cd backend && $(PY) -m uvicorn app.main:app --reload --port 8000

backend-migrate:
	cd backend && $(PY) -m alembic upgrade head

backend-format:
	cd backend && $(PY) -m ruff format app tests scripts

backend-lint:
	cd backend && $(PY) -m ruff check app tests scripts

backend-test:
	cd backend && $(PY) -m pytest

backend-check: backend-lint backend-test

# ── Frontend ────────────────────────────────────────────────────────────
frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

typecheck:
	cd frontend && npx tsc --noEmit

build:
	cd frontend && npm run build
