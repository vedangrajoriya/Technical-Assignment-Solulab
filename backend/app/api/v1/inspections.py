from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.models.entities import QualityInspection
from backend.app.schemas.erp import QualityInspectionCreate, QualityInspectionResponse
from backend.app.services.erp_service import ERPService

router = APIRouter(prefix="/inspections", tags=["Quality Inspection"])

@router.get("", response_model=List[QualityInspectionResponse])
def list_quality_inspections(db: Session = Depends(get_db)):
    inspections = db.query(QualityInspection).order_by(QualityInspection.inspected_at.desc()).all()
    return [
        QualityInspectionResponse(
            id=i.id,
            warehouse_receipt_id=i.warehouse_receipt_id,
            inspection_number=i.inspection_number,
            inspected_quantity=i.inspected_quantity,
            accepted_quantity=i.accepted_quantity,
            rejected_quantity=i.rejected_quantity,
            inspector_name=i.inspector_name,
            rejection_reason=i.rejection_reason,
            status=i.status,
            inspected_at=i.inspected_at
        )
        for i in inspections
    ]

@router.post("", response_model=QualityInspectionResponse, status_code=status.HTTP_201_CREATED)
def record_quality_inspection(payload: QualityInspectionCreate, db: Session = Depends(get_db)):
    inspection = ERPService.create_quality_inspection(db, payload)
    return QualityInspectionResponse(
        id=inspection.id,
        warehouse_receipt_id=inspection.warehouse_receipt_id,
        inspection_number=inspection.inspection_number,
        inspected_quantity=inspection.inspected_quantity,
        accepted_quantity=inspection.accepted_quantity,
        rejected_quantity=inspection.rejected_quantity,
        inspector_name=inspection.inspector_name,
        rejection_reason=inspection.rejection_reason,
        status=inspection.status,
        inspected_at=inspection.inspected_at
    )

