from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# --- Dashboard & Metrics ---
class DashboardMetricsResponse(BaseModel):
    customer_order_number: str
    customer_name: str
    part_name: str
    order_due_date: str
    days_remaining: float
    required_quantity: int
    sent_to_vendor: int
    vendor_reported_dispatch: int
    warehouse_physical_receipt: int
    quality_accepted: int
    quality_rejected: int
    vendor_invoiced_quantity: int
    
    # Derived reconciliations
    unreported_vendor_quantity: int
    transit_discrepancy: int
    customer_shortfall: int
    invoice_vs_physical_variance: int
    invoice_vs_accepted_variance: int
    
    # Risk & Recommendations
    delivery_risk_level: str
    delivery_risk_explanation: str
    recommended_actions: List[str]

# --- Subcontract & Dispatches ---
class SubcontractDispatchSchema(BaseModel):
    id: str
    dispatch_number: str
    quantity: int
    sender_name: str
    dispatched_at: datetime
    remarks: Optional[str] = None

class VendorExternalEventSchema(BaseModel):
    id: str
    external_event_id: str
    event_type: str
    reported_quantity: int
    vendor_name: str
    status: str
    error_message: Optional[str] = None
    attempt_count: int
    processed_at: datetime

class SubcontractJobDetailResponse(BaseModel):
    id: str
    job_number: str
    vendor_name: str
    process_name: str
    status: str
    created_at: datetime
    customer_order_number: str
    required_quantity: int
    dispatches: List[SubcontractDispatchSchema]
    external_events: List[VendorExternalEventSchema]

# --- Warehouse Receipts ---
class WarehouseReceiptCreate(BaseModel):
    subcontract_job_id: str
    receipt_number: Optional[str] = None
    received_quantity: int = Field(gt=0, description="Quantity physically received must be greater than 0")
    received_by: str = Field(min_length=2)
    remarks: Optional[str] = None

class WarehouseReceiptResponse(BaseModel):
    id: str
    subcontract_job_id: str
    receipt_number: str
    received_quantity: int
    received_by: str
    received_at: datetime
    remarks: Optional[str] = None
    inspections_count: int

# --- Quality Inspections ---
class QualityInspectionCreate(BaseModel):
    warehouse_receipt_id: str
    inspection_number: Optional[str] = None
    accepted_quantity: int = Field(ge=0)
    rejected_quantity: int = Field(ge=0)
    inspector_name: str = Field(min_length=2)
    rejection_reason: Optional[str] = None

class QualityInspectionResponse(BaseModel):
    id: str
    warehouse_receipt_id: str
    inspection_number: str
    inspected_quantity: int
    accepted_quantity: int
    rejected_quantity: int
    inspector_name: str
    rejection_reason: Optional[str] = None
    status: str
    inspected_at: datetime

# --- Vendor Invoices ---
class InvoiceReconcileAction(BaseModel):
    action: str = Field(description="FLAG_DISCREPANCY, REQUEST_SUPPORTING_DETAILS, or MARK_REVIEWED")
    action_note: str = Field(min_length=3)
    actor_name: str = Field(default="Accounts / Production Manager")

class VendorInvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    invoiced_quantity: int
    unit_rate: float
    total_amount: float
    reconciliation_status: str
    flagged_reason: Optional[str] = None
    action_note: Optional[str] = None
    reconciled_by: Optional[str] = None
    reconciled_at: Optional[datetime] = None
    physical_receipt_qty: int
    accepted_qty: int
    variance_vs_physical: int
    variance_vs_accepted: int

# --- Vendor Import (Idempotency + Simulation) ---
class VendorImportRequest(BaseModel):
    subcontract_job_id: Optional[str] = None
    external_event_id: str = Field(default="VENDOR-DISPATCH-001", description="Unique idempotency event key")
    reported_quantity: int = Field(default=800, gt=0)
    vendor_name: str = Field(default="Apex Heat Treaters Ltd")
    simulate_failure: bool = Field(default=False, description="Simulate an external network or schema validation failure")
    failure_reason: Optional[str] = "Simulated upstream vendor gateway timeout (HTTP 504)"

class VendorImportResponse(BaseModel):
    status: str # SUCCESS, DUPLICATE_BLOCKED, FAILED, RETRY_SUCCESS
    message: str
    external_event_id: str
    is_duplicate: bool
    reported_quantity: int
    subcontract_job_id: str
    event_record_id: Optional[str] = None
    error_details: Optional[str] = None

# --- Activity History ---
class ActivityLogResponse(BaseModel):
    id: str
    action_type: str
    actor: str
    description: str
    quantity_affected: Optional[int] = None
    status: str
    created_at: datetime

