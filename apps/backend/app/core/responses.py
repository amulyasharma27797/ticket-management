from typing import Any

from pydantic import BaseModel


class ApiResponse(BaseModel):
    success: bool
    data: Any | None = None
    meta: Any | None = None


def success_response(data: Any = None, meta: Any = None) -> dict[str, Any]:
    return ApiResponse(success=True, data=data, meta=meta).model_dump()
