from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.session import AuthSession
from app.repositories.base import BaseRepository


class SessionRepository(BaseRepository[AuthSession]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, AuthSession)

    def create_session(
        self,
        *,
        user_id: UUID,
        refresh_token_hash: str,
        expires_at: datetime,
    ) -> AuthSession:
        session = AuthSession(
            user_id=user_id,
            refresh_token_hash=refresh_token_hash,
            expires_at=expires_at,
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_active_by_hash(self, refresh_token_hash: str) -> AuthSession | None:
        now = datetime.now(UTC)
        stmt = select(AuthSession).where(
            AuthSession.refresh_token_hash == refresh_token_hash,
            AuthSession.revoked_at.is_(None),
            AuthSession.expires_at > now,
        )
        return self.db.scalar(stmt)

    def revoke(self, session: AuthSession) -> None:
        session.revoked_at = datetime.now(UTC)
        self.db.commit()
