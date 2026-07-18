from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_admin, require_admin_or_agent
from app.core.responses import success_response
from app.models.user import User
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.get("")
def list_users(
    _current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service),
) -> dict:
    users = user_service.list_users(_current_user)
    return success_response([user.model_dump(by_alias=True) for user in users])


@router.get("/team")
def list_team_members(
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
) -> dict:
    members = user_service.list_team_members(current_user)
    return success_response([member.model_dump(by_alias=True) for member in members])


@router.get("/{user_id}")
def get_user(
    user_id: UUID,
    current_user: User = Depends(require_admin_or_agent),
    user_service: UserService = Depends(get_user_service),
) -> dict:
    user = user_service.get_user(current_user, user_id)
    return success_response(user.model_dump(by_alias=True))


@router.post("")
def create_user(
    _current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service),
) -> dict:
    user_service.create_user_stub()
    return success_response({})


@router.patch("/{user_id}")
def update_user(
    user_id: UUID,
    _current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service),
) -> dict:
    del user_id
    user_service.update_user_stub()
    return success_response({})


@router.delete("/{user_id}")
def delete_user(
    user_id: UUID,
    _current_user: User = Depends(require_admin),
    user_service: UserService = Depends(get_user_service),
) -> dict:
    del user_id
    user_service.delete_user_stub()
    return success_response({})
