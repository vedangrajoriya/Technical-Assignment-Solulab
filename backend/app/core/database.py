import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

def get_masked_url(url_str: str) -> str:
    """Safely mask password in database connection strings for error logging."""
    try:
        return make_url(url_str).render_as_string(hide_password=True)
    except Exception:
        return "postgresql://***:***@masked_host/db"

# Enforce PostgreSQL architecture: No silent SQLite fallback.
try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True, 
        pool_recycle=300
    )
    with engine.connect() as conn:
        pass
except Exception as e:
    masked_url = get_masked_url(DATABASE_URL)
    error_msg = (
        f"[FATAL DATABASE ERROR] Failed to connect to mandatory PostgreSQL database at '{masked_url}'.\n"
        f"Error details: {e}\n"
        f"Architecture Requirement: PostgreSQL 16 (via Render Managed PostgreSQL or Docker Desktop) "
        f"is mandatory. Silent fallback to SQLite has been strictly disabled per assessment specification."
    )
    print(error_msg)
    raise RuntimeError(error_msg) from e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
