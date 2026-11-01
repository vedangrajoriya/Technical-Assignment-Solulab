from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.models.entities import VendorExternalEvent
from backend.app.schemas.erp import VendorImportRequest, VendorImportResponse, VendorExternalEventSchema
from backend.app.services.erp_service import ERPService
from backend.app.services.seed import seed_scenario

router = APIRouter(prefix="/integration", tags=["External Integration Simulation"])

@router.post("/vendor-import", response_model=VendorImportResponse)
def import_vendor_dispatch_update(payload: VendorImportRequest, db: Session = Depends(get_db)):
    """
    Simulated external vendor dispatch import.
    Features:
    1. Idempotency Guard: Unique external_event_id blocks duplicate processing without double-counting.
    2. Simulated Failure: Demonstrates graceful error capture and logging.
    3. Safe Retry: Allows retrying previously failed imports safely.
    """
    return ERPService.process_vendor_import(db, payload)

@router.get("/events", response_model=List[VendorExternalEventSchema])
def list_vendor_external_events(db: Session = Depends(get_db)):
    events = db.query(VendorExternalEvent).order_by(VendorExternalEvent.processed_at.desc()).all()
    return [
        VendorExternalEventSchema(
            id=e.id,
            external_event_id=e.external_event_id,
            event_type=e.event_type,
            reported_quantity=e.reported_quantity,
            vendor_name=e.vendor_name,
            status=e.status,
            error_message=e.error_message,
            attempt_count=e.attempt_count,
            processed_at=e.processed_at
        )
        for e in events
    ]

@router.post("/reset-scenario")
def reset_to_assessment_baseline():
    """
    Reset database back to the exact initial assessment state:
    - Order: 1,000 (due in 2 days)
    - Dispatched: 1,000
    - Vendor Reported: 800
    - Dock Received: 780
    - Accepted: 740, Rejected: 40
    - Invoiced: 800
    """
    seed_scenario()
    return {"status": "SUCCESS", "message": "Database reset to the original assessment scenario baseline."}

