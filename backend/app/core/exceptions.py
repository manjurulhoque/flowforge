"""Domain exceptions shared across the service layer.

Services raise these; the API layer translates them into HTTP responses
via ``app.api.errors``. Keeping exception types in one place avoids
circular imports between services and routers.
"""


class AppError(Exception):
    """Base class for all application-level errors."""

    status_code = 500
    code = "internal_error"
    message = "An unexpected error occurred."

    def __init__(self, *, message: str | None = None, details: dict | None = None):
        super().__init__(message or self.message)
        self.message = message or self.message
        self.details = details or {}


class NotFoundError(AppError):
    status_code = 404
    code = "not_found"
    message = "Resource not found."


class ConflictError(AppError):
    status_code = 409
    code = "conflict"
    message = "Resource already exists."


class UnauthorizedError(AppError):
    status_code = 401
    code = "unauthorized"
    message = "Authentication required."


class ForbiddenError(AppError):
    status_code = 403
    code = "forbidden"
    message = "You do not have permission to perform this action."


class ValidationError_(AppError):
    status_code = 422
    code = "validation_error"
    message = "The request payload is invalid."


class ServiceUnavailableError(AppError):
    status_code = 503
    code = "service_unavailable"
    message = "A required dependency is unavailable."
