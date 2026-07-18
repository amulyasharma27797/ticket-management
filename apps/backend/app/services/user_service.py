from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError, NotImplementedApiError
from app.core.seed_accounts import is_default_seed_email
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.team import TeamMemberResponse
from app.schemas.user import UserResponse


class UserService:
    def __init__(self, db: Session) -> None:
        self.users = UserRepository(db)

    def list_team_members(self, _current_user: User) -> list[TeamMemberResponse]:
        members = self.users.list_team_members()
        return [self._to_team_member(member) for member in members]

    def list_users(self, current_user: User) -> list[UserResponse]:
        if current_user.role != UserRole.ADMIN:
            raise ForbiddenError("Admin access required")
        return [self._to_response(user) for user in self.users.list_all()]

    def get_user(self, current_user: User, user_id: UUID) -> UserResponse:
        if current_user.role not in {UserRole.ADMIN, UserRole.AGENT}:
            raise ForbiddenError("Admin or agent access required")
        user = self.users.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User not found")
        return self._to_response(user)

    def create_user_stub(self) -> None:
        raise NotImplementedApiError("User creation via API is not yet available")

    def update_user_stub(self) -> None:
        raise NotImplementedApiError("User updates via API are not yet available")

    def delete_user_stub(self) -> None:
        raise NotImplementedApiError("User deletion via API is not yet available")

    def _to_team_member(self, user: User) -> TeamMemberResponse:
        return TeamMemberResponse(
            id=user.id,
            name=user.name,
            role=user.role,
            is_default=is_default_seed_email(user.email),
        )

    def _to_response(self, user: User) -> UserResponse:
        return UserResponse.model_validate(user)
