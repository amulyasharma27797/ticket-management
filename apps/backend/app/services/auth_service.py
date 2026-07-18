from datetime import UTC, datetime, timedelta
from uuid import UUID

from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    decode_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models.user import User
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    AuthTokensResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenRefreshResponse,
)
from app.schemas.user import UserResponse


class AuthService:
    def __init__(self, db: Session) -> None:
        self.users = UserRepository(db)
        self.sessions = SessionRepository(db)

    def register(self, payload: RegisterRequest) -> AuthTokensResponse:
        if self.users.get_by_email(payload.email):
            raise ConflictError(
                "Email already registered",
                details=[{"field": "email", "message": "Email already registered"}],
            )

        user = self.users.create(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )
        return self._issue_tokens(user)

    def login(self, payload: LoginRequest) -> AuthTokensResponse:
        user = self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")
        return self._issue_tokens(user)

    def refresh(self, payload: RefreshRequest) -> TokenRefreshResponse:
        token_hash = hash_refresh_token(payload.refresh_token)
        session = self.sessions.get_active_by_hash(token_hash)
        if session is None:
            raise UnauthorizedError("Invalid or expired refresh token")

        user = session.user
        self.sessions.revoke(session)
        tokens = self._issue_tokens(user)
        return TokenRefreshResponse(
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token,
        )

    def logout(self, user: User, refresh_token: str | None) -> None:
        if refresh_token:
            token_hash = hash_refresh_token(refresh_token)
            session = self.sessions.get_active_by_hash(token_hash)
            if session is not None and session.user_id == user.id:
                self.sessions.revoke(session)

    def get_user_from_token(self, token: str) -> User:
        try:
            payload = decode_access_token(token)
            user_id = UUID(payload["sub"])
        except (JWTError, KeyError, ValueError) as exc:
            raise UnauthorizedError("Invalid or expired access token") from exc

        user = self.users.get_by_id(user_id)
        if user is None:
            raise UnauthorizedError("Invalid or expired access token")
        return user

    def _issue_tokens(self, user: User) -> AuthTokensResponse:
        access_token = create_access_token(
            user_id=str(user.id),
            email=user.email,
            role=user.role.value,
        )
        refresh_token = generate_refresh_token()
        expires_at = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
        self.sessions.create_session(
            user_id=user.id,
            refresh_token_hash=hash_refresh_token(refresh_token),
            expires_at=expires_at,
        )
        return AuthTokensResponse(
            user=UserResponse.model_validate(user),
            access_token=access_token,
            refresh_token=refresh_token,
        )
