import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env from project root if available
env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/mfg_erp")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    try:
        # Fast 1-second timeout to avoid long TCP stalls when postgres container is offline
        engine = create_engine(
            DATABASE_URL,
            connect_args={"connect_timeout": 1},
            pool_pre_ping=True, 
            pool_recycle=300
        )
        with engine.connect() as conn:
            pass
    except Exception as e:
        fallback_url = "sqlite:///./mfg_erp.db"
        print(f"[DATABASE NOTICE] PostgreSQL unavailable ({e}). Using local persistence ({fallback_url}).")
        engine = create_engine(
            fallback_url,
            connect_args={"check_same_thread": False}
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
