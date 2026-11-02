import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Manufacturing Workflow ERP"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:postgres@localhost:5432/mfg_erp"
    )

    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "forgeflow-super-secure-production-jwt-key-2026-mfg-erp")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Seed Super Admin Configuration (Controlled via Environment)
    SEED_ADMIN_EMAIL: str = os.getenv("SEED_ADMIN_EMAIL", "admin@forgeflow.com")
    SEED_ADMIN_USERNAME: str = os.getenv("SEED_ADMIN_USERNAME", "superadmin")
    SEED_ADMIN_PASSWORD: str = os.getenv("SEED_ADMIN_PASSWORD", "Admin@123456")

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        """
        Normalize Render or cloud PostgreSQL URLs to psycopg2 compatible SQLAlchemy scheme.
        Converts 'postgres://' or 'postgresql://' to 'postgresql+psycopg2://'.
        """
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg2://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
                return v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://forgeflow-frontend.onrender.com"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

