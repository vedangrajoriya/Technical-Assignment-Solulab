import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class CustomerOrder(Base):
    __tablename__ = "customer_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_number = Column(String(64), unique=True, nullable=False, index=True)
    customer_name = Column(String(128), nullable=False)
    part_name = Column(String(128), nullable=False)
    required_quantity = Column(Integer, nullable=False, default=1000)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(32), default="IN_PROGRESS", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    subcontract_jobs = relationship("SubcontractJob", back_populates="customer_order", cascade="all, delete-orphan")


class SubcontractJob(Base):
    __tablename__ = "subcontract_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_order_id = Column(String(36), ForeignKey("customer_orders.id"), nullable=False)
    job_number = Column(String(64), unique=True, nullable=False, index=True)
    vendor_name = Column(String(128), nullable=False)
    process_name = Column(String(128), nullable=False)
    status = Column(String(32), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    customer_order = relationship("CustomerOrder", back_populates="subcontract_jobs")
    dispatches = relationship("SubcontractDispatch", back_populates="subcontract_job", cascade="all, delete-orphan")
    external_events = relationship("VendorExternalEvent", back_populates="subcontract_job", cascade="all, delete-orphan")
    receipts = relationship("WarehouseReceipt", back_populates="subcontract_job", cascade="all, delete-orphan")
    invoices = relationship("VendorInvoice", back_populates="subcontract_job", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="subcontract_job", cascade="all, delete-orphan")


class SubcontractDispatch(Base):
    __tablename__ = "subcontract_dispatches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subcontract_job_id = Column(String(36), ForeignKey("subcontract_jobs.id"), nullable=False)
    dispatch_number = Column(String(64), unique=True, nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    sender_name = Column(String(128), nullable=False)
    dispatched_at = Column(DateTime, default=get_utc_now, nullable=False)
    remarks = Column(Text, nullable=True)

    subcontract_job = relationship("SubcontractJob", back_populates="dispatches")


class VendorExternalEvent(Base):
    __tablename__ = "vendor_external_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subcontract_job_id = Column(String(36), ForeignKey("subcontract_jobs.id"), nullable=False)
    external_event_id = Column(String(64), unique=True, nullable=False, index=True)  # Idempotency Key!
    event_type = Column(String(64), default="DISPATCH_UPDATE", nullable=False)
    reported_quantity = Column(Integer, nullable=False)
    vendor_name = Column(String(128), nullable=False)
    status = Column(String(32), default="PROCESSED", nullable=False)  # PROCESSED, FAILED, DUPLICATE_BLOCKED
    payload_json = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    attempt_count = Column(Integer, default=1, nullable=False)
    processed_at = Column(DateTime, default=get_utc_now, nullable=False)

    subcontract_job = relationship("SubcontractJob", back_populates="external_events")


class WarehouseReceipt(Base):
    __tablename__ = "warehouse_receipts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subcontract_job_id = Column(String(36), ForeignKey("subcontract_jobs.id"), nullable=False)
    receipt_number = Column(String(64), unique=True, nullable=False, index=True)
    received_quantity = Column(Integer, nullable=False)
    received_by = Column(String(128), nullable=False)
    received_at = Column(DateTime, default=get_utc_now, nullable=False)
    remarks = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("received_quantity > 0", name="check_positive_received_qty"),
    )

    subcontract_job = relationship("SubcontractJob", back_populates="receipts")
    inspections = relationship("QualityInspection", back_populates="warehouse_receipt", cascade="all, delete-orphan")


class QualityInspection(Base):
    __tablename__ = "quality_inspections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    warehouse_receipt_id = Column(String(36), ForeignKey("warehouse_receipts.id"), nullable=False)
    inspection_number = Column(String(64), unique=True, nullable=False, index=True)
    inspected_quantity = Column(Integer, nullable=False)
    accepted_quantity = Column(Integer, nullable=False)
    rejected_quantity = Column(Integer, nullable=False)
    inspector_name = Column(String(128), nullable=False)
    rejection_reason = Column(Text, nullable=True)
    status = Column(String(32), default="COMPLETED", nullable=False)
    inspected_at = Column(DateTime, default=get_utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint("accepted_quantity >= 0", name="check_positive_accepted_qty"),
        CheckConstraint("rejected_quantity >= 0", name="check_positive_rejected_qty"),
        CheckConstraint("accepted_quantity + rejected_quantity <= inspected_quantity", name="check_inspection_sum"),
    )

    warehouse_receipt = relationship("WarehouseReceipt", back_populates="inspections")


class VendorInvoice(Base):
    __tablename__ = "vendor_invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subcontract_job_id = Column(String(36), ForeignKey("subcontract_jobs.id"), nullable=False)
    invoice_number = Column(String(64), unique=True, nullable=False, index=True)
    invoiced_quantity = Column(Integer, nullable=False)
    unit_rate = Column(Float, default=45.0, nullable=False)
    total_amount = Column(Float, nullable=False)
    reconciliation_status = Column(String(32), default="DISCREPANCY_FLAGGED", nullable=False)
    flagged_reason = Column(Text, nullable=True)
    action_note = Column(Text, nullable=True)
    reconciled_by = Column(String(128), nullable=True)
    reconciled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    subcontract_job = relationship("SubcontractJob", back_populates="invoices")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subcontract_job_id = Column(String(36), ForeignKey("subcontract_jobs.id"), nullable=True)
    action_type = Column(String(64), nullable=False)
    actor = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    quantity_affected = Column(Integer, nullable=True)
    status = Column(String(32), default="SUCCESS", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    subcontract_job = relationship("SubcontractJob", back_populates="activity_logs")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(128), unique=True, nullable=False, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), default="SUPER_ADMIN", nullable=False)  # SUPER_ADMIN, PLANT_MANAGER, QA_LEAD
    is_active = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)


