"""Redis-backed cache with graceful degradation.

Every method returns ``None``/defaults when Redis is unreachable so the
application keeps working (slightly slower) without the cache tier.
"""

import logging

from redis.asyncio import Redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class CacheService:
    """Async string cache with connection pooling handled by redis-py."""

    def __init__(self, url: str | None = None):
        self._client: Redis | None = None
        self._url = url or get_settings().redis_url

    async def _get_client(self) -> Redis | None:
        if self._client is None:
            try:
                self._client = Redis.from_url(
                    self._url, encoding="utf-8", decode_responses=True
                )
                await self._client.ping()
            except Exception:
                logger.warning(
                    "Redis unavailable — running without cache", exc_info=True
                )
                self._client = None
        return self._client

    async def get(self, key: str) -> object | None:
        client = await self._get_client()
        if client is None:
            return None
        try:
            return await client.get(key)
        except Exception:
            logger.warning("Redis GET failed for %s", key, exc_info=True)
            return None

    async def set(self, key: str, value: str, *, ttl_seconds: int = 300) -> None:
        client = await self._get_client()
        if client is None:
            return
        try:
            await client.set(key, value, ex=ttl_seconds)
        except Exception:
            logger.warning("Redis SET failed for %s", key, exc_info=True)

    async def delete(self, key: str) -> None:
        client = await self._get_client()
        if client is None:
            return
        try:
            await client.delete(key)
        except Exception:
            logger.warning("Redis DEL failed for %s", key, exc_info=True)

    async def invalidate_project(self, project_id: str) -> None:
        await self.delete(f"project:{project_id}:validation")
