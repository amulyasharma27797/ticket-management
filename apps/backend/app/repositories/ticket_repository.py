from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.enums import TicketPriority, TicketStatus, UserRole
from app.models.ticket import Ticket
from app.models.user import User
from app.repositories.base import BaseRepository


class TicketRepository(BaseRepository[Ticket]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, Ticket)

    def create(
        self,
        *,
        title: str,
        description: str,
        priority: TicketPriority,
        created_by_id: UUID,
    ) -> Ticket:
        ticket = Ticket(
            title=title,
            description=description,
            priority=priority,
            status=TicketStatus.OPEN,
            created_by_id=created_by_id,
        )
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def get_by_id(self, ticket_id: UUID) -> Ticket | None:
        return self.get(ticket_id)

    def list_visible(
        self,
        current_user: User,
        *,
        limit: int,
        offset: int,
    ) -> tuple[list[Ticket], int]:
        filters = []
        if current_user.role == UserRole.USER:
            filters.append(
                or_(
                    Ticket.created_by_id == current_user.id,
                    Ticket.assigned_to_id == current_user.id,
                )
            )

        count_stmt = select(func.count()).select_from(Ticket)
        list_stmt = select(Ticket).order_by(Ticket.updated_at.desc())
        if filters:
            count_stmt = count_stmt.where(*filters)
            list_stmt = list_stmt.where(*filters)

        total = int(self.db.scalar(count_stmt) or 0)
        tickets = list(self.db.scalars(list_stmt.limit(limit).offset(offset)))
        return tickets, total

    def get_comment_count(self, ticket_id: UUID) -> int:
        from app.models.comment import Comment

        stmt = select(func.count()).select_from(Comment).where(Comment.ticket_id == ticket_id)
        return int(self.db.scalar(stmt) or 0)

    def save(self, ticket: Ticket) -> Ticket:
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
