"""Centralized configuration and environment settings."""

import os
from dotenv import load_dotenv

load_dotenv()

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
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
