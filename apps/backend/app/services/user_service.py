from sqlalchemy.orm import Session

from app.core.seed_accounts import is_default_seed_email
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.team import TeamMemberResponse


class UserService:
    def __init__(self, db: Session) -> None:
        self.users = UserRepository(db)

    def list_team_members(self, _current_user: User) -> list[TeamMemberResponse]:
        members = self.users.list_team_members()
        return [self._to_team_member(member) for member in members]

    def _to_team_member(self, user: User) -> TeamMemberResponse:
        return TeamMemberResponse(
            id=user.id,
            name=user.name,
            role=user.role,
            is_default=is_default_seed_email(user.email),
        )
