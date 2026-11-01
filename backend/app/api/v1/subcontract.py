from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.models.entities import SubcontractJob
from backend.app.schemas.erp import SubcontractJobDetailResponse, SubcontractDispatchSchema, VendorExternalEventSchema

router = APIRouter(prefix="/subcontract", tags=["Subcontract"])

@router.get("/jobs", response_model=List[SubcontractJobDetailResponse])
def get_subcontract_jobs(db: Session = Depends(get_db)):
    jobs = db.query(SubcontractJob).all()
    results = []
    for job in jobs:
        results.append(
            SubcontractJobDetailResponse(
                id=job.id,
                job_number=job.job_number,
                vendor_name=job.vendor_name,
                process_name=job.process_name,
                status=job.status,
                created_at=job.created_at,
                customer_order_number=job.customer_order.order_number,
                required_quantity=job.customer_order.required_quantity,
                dispatches=[
                    SubcontractDispatchSchema(
                        id=d.id,
                        dispatch_number=d.dispatch_number,
                        quantity=d.quantity,
                        sender_name=d.sender_name,
                        dispatched_at=d.dispatched_at,
                        remarks=d.remarks
                    ) for d in job.dispatches
                ],
                external_events=[
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
                    ) for e in job.external_events
                ]
            )
        )
    return results

