from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.dashboard import router as dashboard_router
from backend.app.api.v1.subcontract import router as subcontract_router
from backend.app.api.v1.receipts import router as receipts_router
from backend.app.api.v1.inspections import router as inspections_router
from backend.app.api.v1.invoices import router as invoices_router
from backend.app.api.v1.integration import router as integration_router
from backend.app.api.v1.history import router as history_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(subcontract_router)
api_router.include_router(receipts_router)
api_router.include_router(inspections_router)
api_router.include_router(invoices_router)
api_router.include_router(integration_router)
api_router.include_router(history_router)


