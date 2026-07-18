from collections.abc import Generator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.database.session import get_db as _get_db
from app.models.enums import UserRole
from app.models.user import User
from app.services.auth_service import AuthService

security = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    yield from _get_db()


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise UnauthorizedError("Missing or invalid authorization header")
    return auth_service.get_user_from_token(credentials.credentials)


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenError("Admin access required")
    return current_user


def require_admin_or_agent(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in {UserRole.ADMIN, UserRole.AGENT}:
        raise ForbiddenError("Admin or agent access required")
    return current_user
