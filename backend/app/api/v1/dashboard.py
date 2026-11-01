from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.schemas.erp import DashboardMetricsResponse
from backend.app.services.erp_service import ERPService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardMetricsResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Get consolidated operations dashboard metrics including:
    - Customer requirement (1,000) & 2-day delivery deadline
    - Stage quantities (Dispatched 1000, Vendor 800, Dock 780, Accepted 740, Rejected 40, Billed 800)
    - Transit discrepancy (20 units)
    - Customer shortfall (260 units)
    - Invoice variances (20 vs physical, 60 vs accepted)
    """
    return ERPService.get_dashboard_metrics(db)

