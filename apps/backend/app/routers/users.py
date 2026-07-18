from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.responses import success_response
from app.models.user import User
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.get("/team")
def list_team_members(
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
) -> dict:
    members = user_service.list_team_members(current_user)
    return success_response([member.model_dump(by_alias=True) for member in members])
