"""Database bootstrap: engine, session factory and declarative base."""

from collections.abc import AsyncIterator

from app.core.config import get_settings
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Use a fixed naming convention so Alembic auto-generation is deterministic.
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=NAMING_CONVENTION)


def create_engine_from_url(url: str | None = None) -> AsyncEngine:
    """Build an async engine, primarily for tests / scripts.

    The application itself uses the module-level engine below.
    """
    settings = get_settings()
    engine_url = url or settings.database_url
    return create_async_engine(
        engine_url,
        echo=settings.debug,
        pool_pre_ping=True,
    )


engine = create_engine_from_url()
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding an ``AsyncSession``.

    Commits are the responsibility of the service layer; this dependency
    only guarantees the session is closed and rolled back on error.
    """
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
