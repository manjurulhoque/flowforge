"""Portable column types.

Uses native ``UUID`` on PostgreSQL and a ``CHAR(36)`` fallback on SQLite
so tests can run against an in-memory SQLite database without losing
production fidelity.
"""

import uuid

from sqlalchemy import CHAR, TypeDecorator
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


class GUID(TypeDecorator[uuid.UUID]):
    """Platform-independent UUID column type."""

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect: object) -> object:
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value: uuid.UUID | None, dialect: object) -> object:
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value
        return str(value)

    def process_result_value(self, value: object, dialect: object) -> uuid.UUID | None:
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(str(value))
