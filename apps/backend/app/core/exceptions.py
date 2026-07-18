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
