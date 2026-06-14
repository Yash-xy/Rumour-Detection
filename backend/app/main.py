"""FastAPI application factory — creates and configures the app instance."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.database import Base, engine
from app.routes.auth import router as auth_router
from app.routes.history import router as history_router
from app.routes.predict import router as predict_router
from app.routes.schemes import router as schemes_router

from app.routes.admin import router as admin_router

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SchemeRadar API",
    description="Government Scheme Rumor Detection Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(predict_router)
app.include_router(schemes_router)
app.include_router(auth_router)
app.include_router(history_router)
app.include_router(admin_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
