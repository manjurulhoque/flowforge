"""Declarative base and shared column mixins."""

from datetime import UTC, datetime

from app.db.session import metadata
from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Shared declarative base with a fixed naming convention."""

    metadata = metadata


class TimestampMixin:
    """Adds ``created_at`` / ``updated_at`` columns maintained by the app."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=datetime.now(UTC),
        nullable=False,
    )
