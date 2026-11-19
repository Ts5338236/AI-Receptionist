"""Centralized Exception Handling following RFC 7807 Problem Details."""

import logging
from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_correlation_id

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base application exception for domain errors."""

    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        title: Optional[str] = None,
        code: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.detail = detail
        self.status_code = status_code
        self.title = title or "Application Error"
        self.code = code or "APP_ERROR"
        self.extra = extra or {}
        super().__init__(detail)


class NotFoundException(AppException):
    def __init__(self, detail: str = "Resource not found", extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_404_NOT_FOUND,
            title="Not Found",
            code="RESOURCE_NOT_FOUND",
            extra=extra,
        )


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Authentication required", extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_401_UNAUTHORIZED,
            title="Unauthorized",
            code="UNAUTHORIZED",
            extra=extra,
        )


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Access forbidden", extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_403_FORBIDDEN,
            title="Forbidden",
            code="FORBIDDEN",
            extra=extra,
        )


class ConflictException(AppException):
    def __init__(self, detail: str = "Resource conflict", extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_409_CONFLICT,
            title="Conflict",
            code="RESOURCE_CONFLICT",
            extra=extra,
        )


class ServiceUnavailableException(AppException):
    def __init__(self, detail: str = "Service temporarily unavailable", extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            title="Service Unavailable",
            code="SERVICE_UNAVAILABLE",
            extra=extra,
        )


def create_problem_response(
    status_code: int,
    title: str,
    detail: str,
    code: str,
    instance: str,
    extra: Optional[Dict[str, Any]] = None,
) -> JSONResponse:
    """Builds a standardized RFC 7807 problem details JSON payload."""
    content: Dict[str, Any] = {
        "type": f"https://api.receptionist.internal/errors/{code.lower()}",
        "title": title,
        "status": status_code,
        "detail": detail,
        "code": code,
        "instance": instance,
        "correlation_id": get_correlation_id(),
    }
    if extra:
        content["details"] = extra

    return JSONResponse(
        status_code=status_code,
        content=content,
        headers={"Content-Type": "application/problem+json"},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Attaches centralized error handlers to the FastAPI app instance."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        logger.warning(
            "Application error caught: %s [code=%s, status=%d]",
            exc.detail,
            exc.code,
            exc.status_code,
            extra={"path": request.url.path},
        )
        return create_problem_response(
            status_code=exc.status_code,
            title=exc.title,
            detail=exc.detail,
            code=exc.code,
            instance=request.url.path,
            extra=exc.extra,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        logger.warning(
            "Request validation error on %s: %s",
            request.url.path,
            exc.errors(),
        )
        return create_problem_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            title="Validation Error",
            detail="The request body or parameters failed validation schema checks.",
            code="VALIDATION_ERROR",
            instance=request.url.path,
            extra={"validation_errors": exc.errors()},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        return create_problem_response(
            status_code=exc.status_code,
            title="HTTP Error",
            detail=str(exc.detail),
            code=f"HTTP_{exc.status_code}",
            instance=request.url.path,
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server exception on %s: %s", request.url.path, str(exc))
        return create_problem_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            title="Internal Server Error",
            detail="An unexpected error occurred while processing your request.",
            code="INTERNAL_SERVER_ERROR",
            instance=request.url.path,
        )
