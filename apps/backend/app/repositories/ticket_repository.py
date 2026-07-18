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

    def _visibility_filters(self, current_user: User) -> list:
        filters = []
        if current_user.role == UserRole.USER:
            filters.append(
                or_(
                    Ticket.created_by_id == current_user.id,
                    Ticket.assigned_to_id == current_user.id,
                )
            )
        return filters

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
        search: str | None = None,
        status: TicketStatus | None = None,
        priority: TicketPriority | None = None,
    ) -> tuple[list[Ticket], int]:
        filters = self._visibility_filters(current_user)

        if search:
            term = f"%{search.strip()}%"
            filters.append(or_(Ticket.title.ilike(term), Ticket.description.ilike(term)))

        if status is not None:
            filters.append(Ticket.status == status)

        if priority is not None:
            filters.append(Ticket.priority == priority)

        count_stmt = select(func.count()).select_from(Ticket)
        list_stmt = select(Ticket).order_by(Ticket.updated_at.desc())
        if filters:
            count_stmt = count_stmt.where(*filters)
            list_stmt = list_stmt.where(*filters)

        total = int(self.db.scalar(count_stmt) or 0)
        tickets = list(self.db.scalars(list_stmt.limit(limit).offset(offset)))
        return tickets, total

    def get_visible_stats(self, current_user: User) -> tuple[int, dict[str, int], dict[str, int]]:
        filters = self._visibility_filters(current_user)

        def apply_filters(statement):
            return statement.where(*filters) if filters else statement

        total = int(self.db.scalar(apply_filters(select(func.count()).select_from(Ticket))) or 0)

        status_rows = self.db.execute(
            apply_filters(select(Ticket.status, func.count()).group_by(Ticket.status))
        ).all()
        priority_rows = self.db.execute(
            apply_filters(select(Ticket.priority, func.count()).group_by(Ticket.priority))
        ).all()

        by_status = {status.value: 0 for status in TicketStatus}
        for status, count in status_rows:
            by_status[status.value] = int(count)

        by_priority = {priority.value: 0 for priority in TicketPriority}
        for priority, count in priority_rows:
            by_priority[priority.value] = int(count)

        return total, by_status, by_priority

    def get_comment_count(self, ticket_id: UUID) -> int:
        from app.models.comment import Comment

        stmt = select(func.count()).select_from(Comment).where(Comment.ticket_id == ticket_id)
        return int(self.db.scalar(stmt) or 0)

    def list_created_by_user(self, user_id: UUID) -> list[Ticket]:
        stmt = (
            select(Ticket).where(Ticket.created_by_id == user_id).order_by(Ticket.created_at.desc())
        )
        return list(self.db.scalars(stmt))

    def save(self, ticket: Ticket) -> Ticket:
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
