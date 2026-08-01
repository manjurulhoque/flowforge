"""Refresh token persistence."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import delete, select

from app.models import RefreshToken
from app.repositories.base import BaseRepository


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    """Data access for :class:`RefreshToken` records."""

    model = RefreshToken

    async def find_by_hash(self, token_hash: str) -> RefreshToken | None:
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def revoke(self, token_hash: str) -> None:
        await self._session.execute(
            delete(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )

    async def revoke_all_for_user(self, user_id: UUID) -> None:
        await self._session.execute(
            delete(RefreshToken).where(RefreshToken.user_id == user_id)
        )

    async def delete_expired(self, *, before: datetime | None = None) -> int:
        """Remove tokens that expired before ``before`` (default: now)."""
        cutoff = before or datetime.now(UTC)
        result = await self._session.execute(
            delete(RefreshToken).where(RefreshToken.expires_at < cutoff)
        )
        return result.rowcount or 0
