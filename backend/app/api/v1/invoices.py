from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.models.entities import VendorInvoice, WarehouseReceipt, QualityInspection
from backend.app.schemas.erp import VendorInvoiceResponse, InvoiceReconcileAction
from backend.app.services.erp_service import ERPService

router = APIRouter(prefix="/invoices", tags=["Vendor Invoices"])

@router.get("", response_model=List[VendorInvoiceResponse])
def list_vendor_invoices(db: Session = Depends(get_db)):
    job = ERPService.get_primary_job(db)
    invoices = db.query(VendorInvoice).filter(VendorInvoice.subcontract_job_id == job.id).all()
    
    # Calculate current dock receipt and accepted quantities
    receipts = db.query(WarehouseReceipt).filter(WarehouseReceipt.subcontract_job_id == job.id).all()
    total_physical = sum(r.received_quantity for r in receipts)
    
    receipt_ids = [r.id for r in receipts]
    inspections = db.query(QualityInspection).filter(QualityInspection.warehouse_receipt_id.in_(receipt_ids)).all() if receipt_ids else []
    total_accepted = sum(i.accepted_quantity for i in inspections)

    results = []
    for inv in invoices:
        results.append(
            VendorInvoiceResponse(
                id=inv.id,
                invoice_number=inv.invoice_number,
                invoiced_quantity=inv.invoiced_quantity,
                unit_rate=inv.unit_rate,
                total_amount=inv.total_amount,
                reconciliation_status=inv.reconciliation_status,
                flagged_reason=inv.flagged_reason,
                action_note=inv.action_note,
                reconciled_by=inv.reconciled_by,
                reconciled_at=inv.reconciled_at,
                physical_receipt_qty=total_physical,
                accepted_qty=total_accepted,
                variance_vs_physical=inv.invoiced_quantity - total_physical,
                variance_vs_accepted=inv.invoiced_quantity - total_accepted
            )
        )
    return results

@router.post("/{invoice_id}/reconcile", response_model=VendorInvoiceResponse)
def reconcile_invoice(invoice_id: str, action_data: InvoiceReconcileAction, db: Session = Depends(get_db)):
    inv = ERPService.reconcile_invoice(db, invoice_id, action_data)
    
    # Re-calculate context quantities
    job = inv.subcontract_job
    receipts = db.query(WarehouseReceipt).filter(WarehouseReceipt.subcontract_job_id == job.id).all()
    total_physical = sum(r.received_quantity for r in receipts)
    receipt_ids = [r.id for r in receipts]
    inspections = db.query(QualityInspection).filter(QualityInspection.warehouse_receipt_id.in_(receipt_ids)).all() if receipt_ids else []
    total_accepted = sum(i.accepted_quantity for i in inspections)

    return VendorInvoiceResponse(
        id=inv.id,
        invoice_number=inv.invoice_number,
        invoiced_quantity=inv.invoiced_quantity,
        unit_rate=inv.unit_rate,
        total_amount=inv.total_amount,
        reconciliation_status=inv.reconciliation_status,
        flagged_reason=inv.flagged_reason,
        action_note=inv.action_note,
        reconciled_by=inv.reconciled_by,
        reconciled_at=inv.reconciled_at,
        physical_receipt_qty=total_physical,
        accepted_qty=total_accepted,
        variance_vs_physical=inv.invoiced_quantity - total_physical,
        variance_vs_accepted=inv.invoiced_quantity - total_accepted
    )

