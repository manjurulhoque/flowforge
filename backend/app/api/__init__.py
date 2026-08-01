"""API layer — thin routers wired to the service layer via DI.

Routers must never contain business logic; they parse requests, call a
service and shape the response.
"""

from app.api.deps import get_auth_service, get_export_service, get_project_service
from app.api.errors import register_exception_handlers
from app.api.router import api_router

__all__ = [
    "api_router",
    "get_auth_service",
    "get_export_service",
    "get_project_service",
    "register_exception_handlers",
]
