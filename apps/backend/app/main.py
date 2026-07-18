import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.errors import error_response, exception_to_response
from app.core.exceptions import AppException
from app.core.middleware import RequestIdMiddleware
from app.routers import auth, comments, health, protected, tickets, users

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Support Ticket Management API",
    version="0.1.0",
    description="Support ticket management API with consistent JSON success and error envelopes.",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestIdMiddleware)


@app.exception_handler(AppException)
async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=exception_to_response(exc))


def _format_field_path(location: tuple[str | int, ...]) -> str:
    parts = [str(part) for part in location if part != "body"]
    return parts[-1] if parts else "request"


def _clean_validation_message(message: str, field: str) -> str:
    if message.startswith("Value error, "):
        message = message.removeprefix("Value error, ")

    if field == "password" and "at least 8 characters" in message:
        return "Password must be at least 8 characters with 1 letter and 1 digit"
    if field == "email" and "valid email" in message:
        return "Enter a valid email address"
    if field == "name" and "at least 2 characters" in message:
        return "Name must be at least 2 characters"

    return message


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    _request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    if exc.status_code == 404:
        return JSONResponse(
            status_code=404,
            content=error_response(code="NOT_FOUND", message="Resource not found"),
        )

    detail = exc.detail
    message = detail if isinstance(detail, str) else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(code="HTTP_ERROR", message=message),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content=error_response(
            code="INTERNAL_ERROR",
            message="An unexpected error occurred. Please try again later.",
        ),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    details = [
        {
            "field": _format_field_path(tuple(error.get("loc", ()))),
            "message": _clean_validation_message(
                error.get("msg", "Invalid value"),
                _format_field_path(tuple(error.get("loc", ()))),
            ),
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content=error_response(
            code="VALIDATION_ERROR",
            message="Please fix the highlighted fields.",
            details=details,
        ),
    )


app.include_router(health.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(protected.router, prefix="/api/v1")
app.include_router(tickets.router, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
