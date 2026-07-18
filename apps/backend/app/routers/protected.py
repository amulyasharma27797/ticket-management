from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.responses import success_response
from app.models.user import User

router = APIRouter(prefix="/protected", tags=["protected"])


@router.get("/ping")
def protected_ping(current_user: User = Depends(get_current_user)) -> dict:
    return success_response({"message": "ok", "userId": str(current_user.id)})
