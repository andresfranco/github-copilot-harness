"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-16
"""
import sqlalchemy as sa
from alembic import op

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("default_snowflake_account", sa.String(255), nullable=True),
        sa.Column("default_environment", sa.String(20), nullable=True),
        sa.Column("default_key_size", sa.Integer(), nullable=False, server_default="2048"),
        sa.Column("default_key_slot", sa.String(30), nullable=True),
        sa.Column("default_encrypted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )

    op.create_table(
        "snowflake_keys",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("alias", sa.String(255), nullable=False),
        sa.Column("snowflake_account", sa.String(255), nullable=False),
        sa.Column("snowflake_username", sa.String(255), nullable=False),
        sa.Column("snowflake_role", sa.String(255), nullable=True),
        sa.Column("environment", sa.String(20), nullable=False),
        sa.Column("key_slot", sa.String(30), nullable=False),
        sa.Column("key_size", sa.Integer(), nullable=False),
        sa.Column("is_encrypted", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("status", sa.String(20), nullable=False, server_default="ACTIVE"),
        sa.Column("encrypted_private_key", sa.Text(), nullable=False),
        sa.Column("public_key_pem", sa.Text(), nullable=False),
        sa.Column("public_key_value", sa.Text(), nullable=False),
        sa.Column("snowflake_sql", sa.Text(), nullable=False),
        sa.Column("installation_instructions", sa.Text(), nullable=False),
        sa.Column("auth_examples", sa.Text(), nullable=False),
        sa.Column("expiration_date", sa.Date(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("last_viewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_downloaded_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_snowflake_keys_user_id"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "alias", name="uq_snowflake_key_user_alias"),
    )
    op.create_index("ix_snowflake_keys_user_id", "snowflake_keys", ["user_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("key_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["key_id"], ["snowflake_keys.id"], name="fk_audit_logs_key_id"
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_audit_logs_user_id"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_logs_key_id", "audit_logs", ["key_id"])
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_key_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_snowflake_keys_user_id", table_name="snowflake_keys")
    op.drop_table("snowflake_keys")
    op.drop_table("users")
