"""Database session dependency."""

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session

# Re-exported under a stable name so services/routers import one canonical
# dependency. Tests override this with a SQLite-backed session factory.
get_db = get_db_session


async def db_session_dependency() -> AsyncIterator[AsyncSession]:
    async for session in get_db_session():
        yield session
