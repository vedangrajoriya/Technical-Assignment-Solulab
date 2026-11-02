"""initial_schema

Revision ID: 2e23183d32ef
Revises: 
Create Date: 2026-11-02 16:16:52.960465

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e23183d32ef'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    # 1. customer_orders
    if "customer_orders" not in existing_tables:
        op.create_table(
            "customer_orders",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("order_number", sa.String(length=64), nullable=False),
            sa.Column("customer_name", sa.String(length=128), nullable=False),
            sa.Column("part_name", sa.String(length=128), nullable=False),
            sa.Column("required_quantity", sa.Integer(), nullable=False, server_default="1000"),
            sa.Column("due_date", sa.DateTime(), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="IN_PROGRESS"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("order_number", name="uq_customer_orders_order_number")
        )
        op.create_index("ix_customer_orders_order_number", "customer_orders", ["order_number"])

    # 2. subcontract_jobs
    if "subcontract_jobs" not in existing_tables:
        op.create_table(
            "subcontract_jobs",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("customer_order_id", sa.String(length=36), nullable=False),
            sa.Column("job_number", sa.String(length=64), nullable=False),
            sa.Column("vendor_name", sa.String(length=128), nullable=False),
            sa.Column("process_name", sa.String(length=128), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="ACTIVE"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["customer_order_id"], ["customer_orders.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("job_number", name="uq_subcontract_jobs_job_number")
        )
        op.create_index("ix_subcontract_jobs_job_number", "subcontract_jobs", ["job_number"])

    # 3. subcontract_dispatches
    if "subcontract_dispatches" not in existing_tables:
        op.create_table(
            "subcontract_dispatches",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("subcontract_job_id", sa.String(length=36), nullable=False),
            sa.Column("dispatch_number", sa.String(length=64), nullable=False),
            sa.Column("quantity", sa.Integer(), nullable=False),
            sa.Column("sender_name", sa.String(length=128), nullable=False),
            sa.Column("dispatched_at", sa.DateTime(), nullable=False),
            sa.Column("remarks", sa.Text(), nullable=True),
            sa.ForeignKeyConstraint(["subcontract_job_id"], ["subcontract_jobs.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("dispatch_number", name="uq_subcontract_dispatches_dispatch_number")
        )
        op.create_index("ix_subcontract_dispatches_dispatch_number", "subcontract_dispatches", ["dispatch_number"])

    # 4. vendor_external_events
    if "vendor_external_events" not in existing_tables:
        op.create_table(
            "vendor_external_events",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("subcontract_job_id", sa.String(length=36), nullable=False),
            sa.Column("external_event_id", sa.String(length=64), nullable=False),
            sa.Column("event_type", sa.String(length=64), nullable=False, server_default="DISPATCH_UPDATE"),
            sa.Column("reported_quantity", sa.Integer(), nullable=False),
            sa.Column("vendor_name", sa.String(length=128), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="PROCESSED"),
            sa.Column("payload_json", sa.Text(), nullable=True),
            sa.Column("error_message", sa.Text(), nullable=True),
            sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("processed_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["subcontract_job_id"], ["subcontract_jobs.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("external_event_id", name="uq_vendor_external_events_event_id")
        )
        op.create_index("ix_vendor_external_events_external_event_id", "vendor_external_events", ["external_event_id"])

    # 5. warehouse_receipts
    if "warehouse_receipts" not in existing_tables:
        op.create_table(
            "warehouse_receipts",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("subcontract_job_id", sa.String(length=36), nullable=False),
            sa.Column("receipt_number", sa.String(length=64), nullable=False),
            sa.Column("received_quantity", sa.Integer(), nullable=False),
            sa.Column("received_by", sa.String(length=128), nullable=False),
            sa.Column("received_at", sa.DateTime(), nullable=False),
            sa.Column("remarks", sa.Text(), nullable=True),
            sa.CheckConstraint("received_quantity > 0", name="check_positive_received_qty"),
            sa.ForeignKeyConstraint(["subcontract_job_id"], ["subcontract_jobs.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("receipt_number", name="uq_warehouse_receipts_receipt_number")
        )
        op.create_index("ix_warehouse_receipts_receipt_number", "warehouse_receipts", ["receipt_number"])

    # 6. quality_inspections
    if "quality_inspections" not in existing_tables:
        op.create_table(
            "quality_inspections",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("warehouse_receipt_id", sa.String(length=36), nullable=False),
            sa.Column("inspection_number", sa.String(length=64), nullable=False),
            sa.Column("inspected_quantity", sa.Integer(), nullable=False),
            sa.Column("accepted_quantity", sa.Integer(), nullable=False),
            sa.Column("rejected_quantity", sa.Integer(), nullable=False),
            sa.Column("inspector_name", sa.String(length=128), nullable=False),
            sa.Column("rejection_reason", sa.Text(), nullable=True),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="COMPLETED"),
            sa.Column("inspected_at", sa.DateTime(), nullable=False),
            sa.CheckConstraint("accepted_quantity >= 0", name="check_positive_accepted_qty"),
            sa.CheckConstraint("rejected_quantity >= 0", name="check_positive_rejected_qty"),
            sa.CheckConstraint("accepted_quantity + rejected_quantity <= inspected_quantity", name="check_inspection_sum"),
            sa.ForeignKeyConstraint(["warehouse_receipt_id"], ["warehouse_receipts.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("inspection_number", name="uq_quality_inspections_inspection_number")
        )
        op.create_index("ix_quality_inspections_inspection_number", "quality_inspections", ["inspection_number"])

    # 7. vendor_invoices
    if "vendor_invoices" not in existing_tables:
        op.create_table(
            "vendor_invoices",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("subcontract_job_id", sa.String(length=36), nullable=False),
            sa.Column("invoice_number", sa.String(length=64), nullable=False),
            sa.Column("invoiced_quantity", sa.Integer(), nullable=False),
            sa.Column("unit_rate", sa.Float(), nullable=False, server_default="45.0"),
            sa.Column("total_amount", sa.Float(), nullable=False),
            sa.Column("reconciliation_status", sa.String(length=32), nullable=False, server_default="DISCREPANCY_FLAGGED"),
            sa.Column("flagged_reason", sa.Text(), nullable=True),
            sa.Column("action_note", sa.Text(), nullable=True),
            sa.Column("reconciled_by", sa.String(length=128), nullable=True),
            sa.Column("reconciled_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["subcontract_job_id"], ["subcontract_jobs.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("invoice_number", name="uq_vendor_invoices_invoice_number")
        )
        op.create_index("ix_vendor_invoices_invoice_number", "vendor_invoices", ["invoice_number"])

    # 8. activity_logs
    if "activity_logs" not in existing_tables:
        op.create_table(
            "activity_logs",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("subcontract_job_id", sa.String(length=36), nullable=True),
            sa.Column("action_type", sa.String(length=64), nullable=False),
            sa.Column("actor", sa.String(length=128), nullable=False),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("quantity_affected", sa.Integer(), nullable=True),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="SUCCESS"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["subcontract_job_id"], ["subcontract_jobs.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id")
        )

    # 9. users
    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("email", sa.String(length=128), nullable=False),
            sa.Column("username", sa.String(length=64), nullable=False),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("full_name", sa.String(length=128), nullable=False),
            sa.Column("role", sa.String(length=32), nullable=False, server_default="SUPER_ADMIN"),
            sa.Column("is_active", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email", name="uq_users_email"),
            sa.UniqueConstraint("username", name="uq_users_username")
        )
        op.create_index("ix_users_email", "users", ["email"])
        op.create_index("ix_users_username", "users", ["username"])


def downgrade() -> None:
    # Drop tables in reverse foreign-key dependency order
    op.drop_table("users")
    op.drop_table("activity_logs")
    op.drop_table("vendor_invoices")
    op.drop_table("quality_inspections")
    op.drop_table("warehouse_receipts")
    op.drop_table("vendor_external_events")
    op.drop_table("subcontract_dispatches")
    op.drop_table("subcontract_jobs")
    op.drop_table("customer_orders")
