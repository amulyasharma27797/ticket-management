from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.comment import Comment
from app.repositories.base import BaseRepository


class CommentRepository(BaseRepository[Comment]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, Comment)

    def create(self, *, ticket_id: UUID, message: str, created_by_id: UUID) -> Comment:
        comment = Comment(
            ticket_id=ticket_id,
            message=message,
            created_by_id=created_by_id,
        )
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return self.get_with_author(comment.id) or comment

    def list_by_ticket_id(self, ticket_id: UUID) -> list[Comment]:
        stmt = (
            select(Comment)
            .options(joinedload(Comment.author))
            .where(Comment.ticket_id == ticket_id)
            .order_by(Comment.created_at.asc())
        )
        return list(self.db.scalars(stmt).unique())

    def get_with_author(self, comment_id: UUID) -> Comment | None:
        stmt = select(Comment).options(joinedload(Comment.author)).where(Comment.id == comment_id)
        return self.db.scalars(stmt).unique().first()
