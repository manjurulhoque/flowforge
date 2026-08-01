"""Generic async SQLAlchemy repository base.

Concrete repositories inherit from :class:`BaseRepository` to get CRUD
primitives; they add intent-named methods on top. Repositories never
commit — the service layer owns the transaction lifecycle.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base


class BaseRepository[ModelT: Base]:
    """Thin generic CRUD over an async session."""

    model: type[ModelT]

    def __init__(self, session: AsyncSession):
        self._session = session

    async def get(self, *ident: object) -> ModelT | None:
        return await self._session.get(self.model, ident)

    async def add(self, instance: ModelT) -> ModelT:
        self._session.add(instance)
        await self._session.flush()
        return instance

    async def delete(self, instance: ModelT) -> None:
        await self._session.delete(instance)
        await self._session.flush()

    async def list_all(self, *, limit: int = 100, offset: int = 0) -> list[ModelT]:
        stmt = (
            select(self.model)
            .order_by(self.model.created_at.desc())  # type: ignore[attr-defined]
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
