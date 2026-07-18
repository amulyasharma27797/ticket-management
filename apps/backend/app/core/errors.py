from typing import Any

from app.core.exceptions import AppException


def error_response(
    *,
    code: str,
    message: str,
    details: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
        },
    }


def exception_to_response(exc: AppException) -> dict[str, Any]:
    return error_response(code=exc.code, message=exc.message, details=exc.details)
