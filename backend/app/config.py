"""Centralized configuration and environment settings."""

import os
from dotenv import load_dotenv

load_dotenv()

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def _parse_cors_origins(value: str | None) -> list[str]:
    if not value:
        return DEFAULT_CORS_ORIGINS

    origins = [origin.strip() for origin in value.split(",") if origin.strip()]
    return origins or DEFAULT_CORS_ORIGINS

# Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Yash@localhost:5432/rumor_detection",
)

# JWT / Auth
SECRET_KEY = os.getenv("SECRET_KEY", "secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 2

# CORS allowed origins
CORS_ORIGINS = _parse_cors_origins(os.getenv("CORS_ORIGINS"))
