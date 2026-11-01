import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from backend.app.models.entities import (
    CustomerOrder,
    SubcontractJob,
    SubcontractDispatch,
    VendorExternalEvent,
    WarehouseReceipt,
    QualityInspection,
    VendorInvoice,
    ActivityLog,
    generate_uuid,
    get_utc_now
)
from backend.app.schemas.erp import (
    DashboardMetricsResponse,
    WarehouseReceiptCreate,
    QualityInspectionCreate,
    InvoiceReconcileAction,
    VendorImportRequest,
    VendorImportResponse
)

class ERPService:

    @staticmethod
    def get_primary_job(db: Session) -> SubcontractJob:
        job = db.query(SubcontractJob).first()
        if not job:
            raise HTTPException(status_code=404, detail="No active subcontract job found. Please run seed script.")
        return job

    @staticmethod
    def get_dashboard_metrics(db: Session) -> DashboardMetricsResponse:
        job = ERPService.get_primary_job(db)
        order = job.customer_order

        # 1. Total Sent to Vendor
        sent_qty = db.query(func.coalesce(func.sum(SubcontractDispatch.quantity), 0))\
            .filter(SubcontractDispatch.subcontract_job_id == job.id).scalar()

        # 2. Vendor-Reported Dispatched (Sum of successful processed events)
        vendor_reported_qty = db.query(func.coalesce(func.sum(VendorExternalEvent.reported_quantity), 0))\
            .filter(
                VendorExternalEvent.subcontract_job_id == job.id,
                VendorExternalEvent.status == "PROCESSED"
            ).scalar()

        # 3. Warehouse Physical Receipt
        receipts = db.query(WarehouseReceipt).filter(WarehouseReceipt.subcontract_job_id == job.id).all()
        physical_receipt_qty = sum(r.received_quantity for r in receipts)

        # 4. Quality Accepted & Rejected
        receipt_ids = [r.id for r in receipts]
        inspections = db.query(QualityInspection).filter(QualityInspection.warehouse_receipt_id.in_(receipt_ids)).all() if receipt_ids else []
        quality_accepted_qty = sum(i.accepted_quantity for i in inspections)
        quality_rejected_qty = sum(i.rejected_quantity for i in inspections)

        # 5. Vendor Invoiced Quantity
        invoices = db.query(VendorInvoice).filter(VendorInvoice.subcontract_job_id == job.id).all()
        invoiced_qty = sum(inv.invoiced_quantity for inv in invoices)

        # Calculations
        required_qty = order.required_quantity
        unreported_vendor_qty = max(0, sent_qty - vendor_reported_qty)
        transit_discrepancy = vendor_reported_qty - physical_receipt_qty
        customer_shortfall = max(0, required_qty - quality_accepted_qty)
        invoice_vs_physical = invoiced_qty - physical_receipt_qty
        invoice_vs_accepted = invoiced_qty - quality_accepted_qty

        # Due date calculations
        now = datetime.now(timezone.utc)
        order_due = order.due_date
        if order_due.tzinfo is None:
            order_due = order_due.replace(tzinfo=timezone.utc)
        days_remaining = round((order_due - now).total_seconds() / 86400.0, 1)

        # Risk assessment
        risk_level = "CRITICAL" if customer_shortfall > 0 and days_remaining <= 3.0 else "MODERATE"
        risk_explanation = (
            f"Delivery deadline in {days_remaining} days. Customer requires {required_qty} units, "
            f"but currently only {quality_accepted_qty} units are accepted into finished usable inventory. "
            f"A deficit of {customer_shortfall} units will breach the OEM delivery schedule unless expedited."
        )

        recommended_actions = [
            f"Expedite vendor report for remaining {unreported_vendor_qty} units still at heat treatment facility.",
            f"Investigate dock transit loss: 20 units reported dispatched by vendor but never checked in at warehouse.",
            f"Expedite engineering rework disposition on the {quality_rejected_qty} quarantined rejected components.",
            f"Hold vendor invoice approval: billed for {invoiced_qty} units, but warehouse physically received only {physical_receipt_qty} units (variance of 20 units)."
        ]

        return DashboardMetricsResponse(
            customer_order_number=order.order_number,
            customer_name=order.customer_name,
            part_name=order.part_name,
            order_due_date=order.due_date.strftime("%Y-%m-%d %H:%M UTC"),
            days_remaining=days_remaining,
            required_quantity=required_qty,
            sent_to_vendor=sent_qty,
            vendor_reported_dispatch=vendor_reported_qty,
            warehouse_physical_receipt=physical_receipt_qty,
            quality_accepted=quality_accepted_qty,
            quality_rejected=quality_rejected_qty,
            vendor_invoiced_quantity=invoiced_qty,
            unreported_vendor_quantity=unreported_vendor_qty,
            transit_discrepancy=transit_discrepancy,
            customer_shortfall=customer_shortfall,
            invoice_vs_physical_variance=invoice_vs_physical,
            invoice_vs_accepted_variance=invoice_vs_accepted,
            delivery_risk_level=risk_level,
            delivery_risk_explanation=risk_explanation,
            recommended_actions=recommended_actions
        )

    @staticmethod
    def create_warehouse_receipt(db: Session, data: WarehouseReceiptCreate):
        job = db.query(SubcontractJob).filter(SubcontractJob.id == data.subcontract_job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Subcontract job not found")

        receipt_number = data.receipt_number or f"GRN-{datetime.now().strftime('%Y%m%d')}-{db.query(WarehouseReceipt).count() + 1:04d}"
        
        receipt = WarehouseReceipt(
            id=generate_uuid(),
            subcontract_job_id=job.id,
            receipt_number=receipt_number,
            received_quantity=data.received_quantity,
            received_by=data.received_by,
            received_at=get_utc_now(),
            remarks=data.remarks
        )
        db.add(receipt)

        # Log Activity
        log = ActivityLog(
            id=generate_uuid(),
            subcontract_job_id=job.id,
            action_type="WAREHOUSE_RECEIPT_RECORDED",
            actor=f"Warehouse ({data.received_by})",
            description=f"Physical Goods Receipt {receipt_number} recorded for {data.received_quantity} units at dock.",
            quantity_affected=data.received_quantity,
            status="SUCCESS",
            created_at=get_utc_now()
        )
        db.add(log)
        db.commit()
        db.refresh(receipt)
        return receipt

    @staticmethod
    def create_quality_inspection(db: Session, data: QualityInspectionCreate):
        receipt = db.query(WarehouseReceipt).filter(WarehouseReceipt.id == data.warehouse_receipt_id).first()
        if not receipt:
            raise HTTPException(status_code=404, detail="Warehouse receipt not found")

        if data.accepted_quantity + data.rejected_quantity > receipt.received_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Accepted ({data.accepted_quantity}) + Rejected ({data.rejected_quantity}) cannot exceed physical received quantity ({receipt.received_quantity})"
            )

        inspection_number = data.inspection_number or f"QC-{datetime.now().strftime('%Y%m%d')}-{db.query(QualityInspection).count() + 1:04d}"

        inspection = QualityInspection(
            id=generate_uuid(),
            warehouse_receipt_id=receipt.id,
            inspection_number=inspection_number,
            inspected_quantity=receipt.received_quantity,
            accepted_quantity=data.accepted_quantity,
            rejected_quantity=data.rejected_quantity,
            inspector_name=data.inspector_name,
            rejection_reason=data.rejection_reason,
            status="COMPLETED",
            inspected_at=get_utc_now()
        )
        db.add(inspection)

        # Log Activity
        log = ActivityLog(
            id=generate_uuid(),
            subcontract_job_id=receipt.subcontract_job_id,
            action_type="QUALITY_INSPECTION_RECORDED",
            actor=f"Quality Dept ({data.inspector_name})",
            description=f"Inspection {inspection_number} finalized: {data.accepted_quantity} accepted, {data.rejected_quantity} quarantined for rework.",
            quantity_affected=data.accepted_quantity,
            status="SUCCESS",
            created_at=get_utc_now()
        )
        db.add(log)
        db.commit()
        db.refresh(inspection)
        return inspection

    @staticmethod
    def reconcile_invoice(db: Session, invoice_id: str, action_data: InvoiceReconcileAction):
        invoice = db.query(VendorInvoice).filter(VendorInvoice.id == invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        valid_actions = ["FLAG_DISCREPANCY", "REQUEST_SUPPORTING_DETAILS", "MARK_REVIEWED"]
        if action_data.action not in valid_actions:
            raise HTTPException(status_code=400, detail=f"Invalid reconciliation action. Must be one of: {valid_actions}")

        invoice.reconciliation_status = action_data.action
        invoice.action_note = action_data.action_note
        invoice.reconciled_by = action_data.actor_name
        invoice.reconciled_at = get_utc_now()

        # Log Activity
        log = ActivityLog(
            id=generate_uuid(),
            subcontract_job_id=invoice.subcontract_job_id,
            action_type="INVOICE_RECONCILIATION_ACTION",
            actor=action_data.actor_name,
            description=f"Invoice {invoice.invoice_number} reconciliation status updated to '{action_data.action}'. Note: {action_data.action_note}",
            quantity_affected=invoice.invoiced_quantity,
            status="SUCCESS",
            created_at=get_utc_now()
        )
        db.add(log)
        db.commit()
        db.refresh(invoice)
        return invoice

    @staticmethod
    def process_vendor_import(db: Session, req: VendorImportRequest) -> VendorImportResponse:
        """
        Idempotent external vendor update processor with simulated failure and retry handling.
        Enforces backend & database uniqueness on external_event_id.
        """
        job = db.query(SubcontractJob).filter(SubcontractJob.id == req.subcontract_job_id).first() if req.subcontract_job_id else db.query(SubcontractJob).first()
        if not job:
            raise HTTPException(status_code=404, detail="Subcontract job not found")

        # 1. Check if external_event_id has already been received
        existing_event = db.query(VendorExternalEvent).filter(
            VendorExternalEvent.external_event_id == req.external_event_id
        ).first()

        # Handle Duplicate Protection
        if existing_event and existing_event.status == "PROCESSED":
            log = ActivityLog(
                id=generate_uuid(),
                subcontract_job_id=job.id,
                action_type="VENDOR_IMPORT_DUPLICATE_IGNORED",
                actor="System (Idempotency Engine)",
                description=f"Duplicate vendor event '{req.external_event_id}' rejected. Quantities not double-counted.",
                quantity_affected=0,
                status="DUPLICATE_BLOCKED",
                created_at=get_utc_now()
            )
            db.add(log)
            db.commit()
            return VendorImportResponse(
                status="DUPLICATE_BLOCKED",
                message=f"Idempotency Guard: Event ID '{req.external_event_id}' was already processed on {existing_event.processed_at.strftime('%Y-%m-%d %H:%M UTC')}. Discarded duplicate submission to prevent double-counting.",
                external_event_id=req.external_event_id,
                is_duplicate=True,
                reported_quantity=existing_event.reported_quantity,
                subcontract_job_id=job.id,
                event_record_id=existing_event.id
            )

        # Handle Simulated Failure
        if req.simulate_failure:
            if existing_event:
                existing_event.status = "FAILED"
                existing_event.error_message = req.failure_reason
                existing_event.attempt_count += 1
                event_record = existing_event
            else:
                event_record = VendorExternalEvent(
                    id=generate_uuid(),
                    subcontract_job_id=job.id,
                    external_event_id=req.external_event_id,
                    event_type="DISPATCH_UPDATE",
                    reported_quantity=req.reported_quantity,
                    vendor_name=req.vendor_name,
                    status="FAILED",
                    payload_json=json.dumps(req.model_dump()),
                    error_message=req.failure_reason,
                    attempt_count=1,
                    processed_at=get_utc_now()
                )
                db.add(event_record)

            log = ActivityLog(
                id=generate_uuid(),
                subcontract_job_id=job.id,
                action_type="VENDOR_IMPORT_SIMULATED_FAILURE",
                actor="Simulated External Vendor Gateway",
                description=f"Import of {req.external_event_id} failed: {req.failure_reason}",
                quantity_affected=0,
                status="FAILED",
                created_at=get_utc_now()
            )
            db.add(log)
            db.commit()
            db.refresh(event_record)

            return VendorImportResponse(
                status="FAILED",
                message=f"Simulated Integration Failure: {req.failure_reason}",
                external_event_id=req.external_event_id,
                is_duplicate=False,
                reported_quantity=req.reported_quantity,
                subcontract_job_id=job.id,
                event_record_id=event_record.id,
                error_details=req.failure_reason
            )

        # Handle Safe Retry of a previously failed event
        if existing_event and existing_event.status == "FAILED":
            existing_event.status = "PROCESSED"
            existing_event.error_message = None
            existing_event.attempt_count += 1
            existing_event.processed_at = get_utc_now()

            log = ActivityLog(
                id=generate_uuid(),
                subcontract_job_id=job.id,
                action_type="VENDOR_IMPORT_RETRY_SUCCESS",
                actor="External Vendor Integration (Retry)",
                description=f"Retry succeeded for event {req.external_event_id}. Recorded vendor dispatch of {req.reported_quantity} units.",
                quantity_affected=req.reported_quantity,
                status="SUCCESS",
                created_at=get_utc_now()
            )
            db.add(log)
            db.commit()
            db.refresh(existing_event)

            return VendorImportResponse(
                status="RETRY_SUCCESS",
                message=f"Safe Retry Successful: Event '{req.external_event_id}' has been processed. Vendor reported return of {req.reported_quantity} units.",
                external_event_id=req.external_event_id,
                is_duplicate=False,
                reported_quantity=req.reported_quantity,
                subcontract_job_id=job.id,
                event_record_id=existing_event.id
            )

        # Normal Fresh Successful Import
        new_event = VendorExternalEvent(
            id=generate_uuid(),
            subcontract_job_id=job.id,
            external_event_id=req.external_event_id,
            event_type="DISPATCH_UPDATE",
            reported_quantity=req.reported_quantity,
            vendor_name=req.vendor_name,
            status="PROCESSED",
            payload_json=json.dumps(req.model_dump()),
            error_message=None,
            attempt_count=1,
            processed_at=get_utc_now()
        )
        db.add(new_event)

        log = ActivityLog(
            id=generate_uuid(),
            subcontract_job_id=job.id,
            action_type="VENDOR_UPDATE_IMPORTED",
            actor="External Vendor Integration",
            description=f"Imported vendor dispatch update {req.external_event_id} ({req.reported_quantity} units reported dispatched).",
            quantity_affected=req.reported_quantity,
            status="SUCCESS",
            created_at=get_utc_now()
        )
        db.add(log)
        db.commit()
        db.refresh(new_event)

        return VendorImportResponse(
            status="SUCCESS",
            message=f"Successfully imported external vendor update '{req.external_event_id}' with {req.reported_quantity} units reported dispatched.",
            external_event_id=req.external_event_id,
            is_duplicate=False,
            reported_quantity=req.reported_quantity,
            subcontract_job_id=job.id,
            event_record_id=new_event.id
        )

