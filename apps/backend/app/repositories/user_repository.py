from uuid import UUID

from sqlalchemy import case, select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, User)

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self.db.scalar(stmt)

    def create(
        self, *, name: str, email: str, password_hash: str, role: UserRole = UserRole.USER
    ) -> User:
        user = User(name=name, email=email, password_hash=password_hash, role=role)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: UUID) -> User | None:
        return self.get(user_id)

    def list_team_members(self) -> list[User]:
        role_order = case(
            (User.role == UserRole.ADMIN, 0),
            (User.role == UserRole.AGENT, 1),
            else_=2,
        )
        stmt = select(User).order_by(role_order, User.name.asc())
        return list(self.db.scalars(stmt))

    def list_all(self) -> list[User]:
        stmt = select(User).order_by(User.name.asc())
        return list(self.db.scalars(stmt))
