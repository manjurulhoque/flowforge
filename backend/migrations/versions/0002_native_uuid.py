"""Convert GUID columns to native UUID on PostgreSQL.

Revision ID: 0002_native_uuid
Revises: 0001_initial
Create Date: 2026-08-01 00:00:00.000000

The initial migration hardcoded ``CHAR(36)`` for every GUID column, but
``app.db.types.GUID`` binds parameters as real ``uuid.UUID`` objects on
PostgreSQL, so ``character = uuid`` comparisons fail at runtime. This
migration rewrites the existing columns in place (no data loss) and is a
no-op on SQLite, where ``CHAR(36)`` is the intended storage anyway.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

# revision identifiers, used by Alembic.
revision = "0002_native_uuid"
down_revision = "0001_initial"
branch_labels = None
depends_on = None

# (table, column) pairs that must become native UUIDs on PostgreSQL.
_GUID_COLUMNS = [
    ("users", "id"),
    ("refresh_tokens", "id"),
    ("refresh_tokens", "user_id"),
    ("projects", "id"),
    ("projects", "owner_id"),
    ("nodes", "project_id"),
    ("edges", "project_id"),
]

# Foreign keys that reference GUID columns; dropped before the type change
# and recreated afterwards (Postgres forbids altering a column used by a FK).
_GUID_FKS = [
    (
        "fk_refresh_tokens_user_id_users",
        "refresh_tokens",
        "users",
        ["user_id"],
        ["id"],
    ),
    ("fk_projects_owner_id_users", "projects", "users", ["owner_id"], ["id"]),
    (
        "fk_nodes_project_id_projects",
        "nodes",
        "projects",
        ["project_id"],
        ["id"],
    ),
    (
        "fk_edges_project_id_projects",
        "edges",
        "projects",
        ["project_id"],
        ["id"],
    ),
]

_FK_TABLES = {fk[0]: fk[1] for fk in _GUID_FKS}

_GUID_INDEXES = [
    ("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"]),
    ("ix_projects_owner_id", "projects", ["owner_id"]),
    ("ix_nodes_project_id", "nodes", ["project_id"]),
    ("ix_edges_project_id", "edges", ["project_id"]),
]


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        # SQLite already stores GUIDs as CHAR(36) — nothing to fix.
        return

    # 1. Drop FKs and indexes so column types can change.
    for name, *_ in _GUID_FKS:
        op.drop_constraint(name, _FK_TABLES[name], type_="foreignkey")
    for name, table, _ in _GUID_INDEXES:
        op.drop_index(name, table_name=table)

    # 2. Rewrite the columns in place. CHAR(36) holds canonical 36-char
    #    UUID strings, so ``col::uuid`` casts cleanly.
    for table, column in _GUID_COLUMNS:
        op.alter_column(
            table,
            column,
            type_=PG_UUID(as_uuid=True),
            postgresql_using=f"{column}::uuid",
        )

    # 3. Recreate indexes and FKs.
    for name, table, columns in _GUID_INDEXES:
        op.create_index(name, table, columns, unique=False)
    for name, table, ref_table, columns, ref_columns in _GUID_FKS:
        op.create_foreign_key(
            name, table, ref_table, columns, ref_columns, ondelete="CASCADE"
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return

    for name, *_ in _GUID_FKS:
        op.drop_constraint(name, _FK_TABLES[name], type_="foreignkey")
    for name, table, _ in _GUID_INDEXES:
        op.drop_index(name, table_name=table)

    for table, column in _GUID_COLUMNS:
        op.alter_column(
            table,
            column,
            type_=sa.CHAR(36),
            postgresql_using=f"{column}::text",
        )

    for name, table, columns in _GUID_INDEXES:
        op.create_index(name, table, columns, unique=False)
    for name, table, ref_table, columns, ref_columns in _GUID_FKS:
        op.create_foreign_key(
            name, table, ref_table, columns, ref_columns, ondelete="CASCADE"
        )
