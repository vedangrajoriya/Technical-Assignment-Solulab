from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.models.entities import WarehouseReceipt
from backend.app.schemas.erp import WarehouseReceiptCreate, WarehouseReceiptResponse
from backend.app.services.erp_service import ERPService

router = APIRouter(prefix="/receipts", tags=["Warehouse Receipts"])

@router.get("", response_model=List[WarehouseReceiptResponse])
def list_warehouse_receipts(db: Session = Depends(get_db)):
    receipts = db.query(WarehouseReceipt).order_by(WarehouseReceipt.received_at.desc()).all()
    return [
        WarehouseReceiptResponse(
            id=r.id,
            subcontract_job_id=r.subcontract_job_id,
            receipt_number=r.receipt_number,
            received_quantity=r.received_quantity,
            received_by=r.received_by,
            received_at=r.received_at,
            remarks=r.remarks,
            inspections_count=len(r.inspections)
        )
        for r in receipts
    ]

@router.post("", response_model=WarehouseReceiptResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse_receipt(payload: WarehouseReceiptCreate, db: Session = Depends(get_db)):
    receipt = ERPService.create_warehouse_receipt(db, payload)
    return WarehouseReceiptResponse(
        id=receipt.id,
        subcontract_job_id=receipt.subcontract_job_id,
        receipt_number=receipt.receipt_number,
        received_quantity=receipt.received_quantity,
        received_by=receipt.received_by,
        received_at=receipt.received_at,
        remarks=receipt.remarks,
        inspections_count=len(receipt.inspections)
    )

