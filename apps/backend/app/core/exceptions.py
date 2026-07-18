class AppException(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message: str,
        details: list[dict[str, str]] | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details
        super().__init__(message)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Unauthorized") -> None:
        super().__init__(status_code=401, code="UNAUTHORIZED", message=message)


class ConflictError(AppException):
    def __init__(self, message: str, *, details: list[dict[str, str]] | None = None) -> None:
        super().__init__(
            status_code=409,
            code="CONFLICT",
            message=message,
            details=details,
        )


class ValidationError(AppException):
    def __init__(
        self,
        message: str,
        *,
        details: list[dict[str, str]] | None = None,
    ) -> None:
        super().__init__(
            status_code=422,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(status_code=404, code="NOT_FOUND", message=message)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden") -> None:
        super().__init__(status_code=403, code="FORBIDDEN", message=message)


class TicketNotEditableError(AppException):
    def __init__(self, message: str = "Ticket cannot be edited in its current status") -> None:
        super().__init__(status_code=403, code="TICKET_NOT_EDITABLE", message=message)


class InvalidStatusTransitionError(AppException):
    def __init__(self, message: str = "Invalid ticket status transition") -> None:
        super().__init__(status_code=400, code="INVALID_STATUS_TRANSITION", message=message)
