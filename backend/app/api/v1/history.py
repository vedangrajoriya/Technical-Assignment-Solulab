from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.models.entities import ActivityLog
from backend.app.schemas.erp import ActivityLogResponse

router = APIRouter(prefix="/history", tags=["Activity History"])

@router.get("", response_model=List[ActivityLogResponse])
def get_activity_history(limit: int = 100, db: Session = Depends(get_db)):
    """
    Get chronological activity audit history across all manufacturing and reconciliation steps.
    """
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return [
        ActivityLogResponse(
            id=log.id,
            action_type=log.action_type,
            actor=log.actor,
            description=log.description,
            quantity_affected=log.quantity_affected,
            status=log.status,
            created_at=log.created_at
        )
        for log in logs
    ]

