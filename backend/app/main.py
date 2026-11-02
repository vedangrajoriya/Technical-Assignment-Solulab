from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.api.v1.router import api_router
from backend.app.models.entities import CustomerOrder
from backend.app.services.seed import seed_scenario

@asynccontextmanager
async def lifespan(app: FastAPI):
    # In non-production environments, ensure tables exist as convenience if migrations were skipped
    if settings.ENVIRONMENT.lower() != "production":
        Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(CustomerOrder).first():
            print("[STARTUP] Empty database detected. Seeding initial manufacturing assessment scenario...")
            seed_scenario()
    finally:
        db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Manufacturing Workflow ERP Prototype with Subcontracting Discrepancy Reconciliation",
    lifespan=lifespan
)

# Configure CORS with strict explicit origin whitelisting (no arbitrary wildcard or broad subdomain regex)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoint
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Mount API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve Frontend static build if available (Unified Railway / Local Deployment)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_frontend(full_path: str):
        index_file = os.path.join(frontend_dist, "index.html")
        return FileResponse(index_file)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
