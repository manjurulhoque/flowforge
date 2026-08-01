"""Application configuration.

All settings are read from environment variables / a local ``.env`` file
via pydantic-settings. Never import :mod:`os` directly elsewhere — use
:func:`get_settings` so tests can override values cleanly.
"""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings.

    The ``model_config`` points at ``backend/.env`` so ``uv run`` works
    out of the box while still honouring real environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ── App ────────────────────────────────────────────────────────────
    app_name: str = "FlowForge API"
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    api_v1_prefix: str = Field(default="/api")
    log_level: str = Field(default="INFO")

    # ── Security ───────────────────────────────────────────────────────
    secret_key: str = Field(default="change-me-in-production")
    token_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=15)
    refresh_token_expire_days: int = Field(default=30)

    # ── Database ───────────────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql+asyncpg://flowforge:flowforge@localhost:5434/flowforge"
    )

    # ── Redis ──────────────────────────────────────────────────────────
    redis_url: str = Field(default="redis://localhost:6380/0")

    # ── CORS ───────────────────────────────────────────────────────────
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors(cls, value: object) -> object:
        """Accept either a comma-separated string or a JSON list."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, (list, tuple)):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        """Normalised list of allowed CORS origins."""
        return list(self.cors_origins)


@lru_cache
def get_settings() -> Settings:
    """Return a cached :class:`Settings` instance (singleton per process)."""
    return Settings()
