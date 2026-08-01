"""API router aggregation and WebSocket routes."""

from fastapi import APIRouter

from app.api.routes import auth, export, health, projects, validation
from app.api.ws import router as ws_router

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(validation.router)
api_router.include_router(export.router)
api_router.include_router(health.router)
api_router.include_router(ws_router)
