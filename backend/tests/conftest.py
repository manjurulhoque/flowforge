"""Shared pytest fixtures.

The test suite runs against an in-memory SQLite database via aiosqlite:
the same GUID/JSON type decorators work on both PostgreSQL and SQLite, so
unit + API tests need no external infrastructure.
"""

from collections.abc import AsyncIterator

import app.models
import pytest
from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool


@pytest.fixture
async def engine():
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture
async def db_session_factory(engine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture
async def client(db_session_factory) -> AsyncIterator[AsyncClient]:
    """API client with the DB dependency pointed at the test database."""

    async def override_get_db() -> AsyncIterator[AsyncSession]:
        async with db_session_factory() as session:
            yield session

    app.dependency_overrides[get_db_session] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
async def registered_user(client: AsyncClient) -> dict[str, str]:
    """Register + login a fresh user; return their tokens and profile."""
    resp = await client.post(
        "/api/auth/register",
        json={"email": "alice@example.com", "password": "hunter2hunter2"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def auth_headers(tokens: dict[str, str]) -> dict[str, str]:
    return {"Authorization": f"Bearer {tokens['access_token']}"}
