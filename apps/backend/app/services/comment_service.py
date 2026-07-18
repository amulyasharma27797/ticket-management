from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.enums import UserRole
from app.models.ticket import Ticket
from app.models.user import User
from app.repositories.comment_repository import CommentRepository
from app.repositories.ticket_repository import TicketRepository
from app.schemas.comment import CommentCreateRequest, CommentResponse


class CommentService:
    def __init__(self, db: Session) -> None:
        self.comments = CommentRepository(db)
        self.tickets = TicketRepository(db)

    def list_comments(self, current_user: User, ticket_id: UUID) -> list[CommentResponse]:
        ticket = self._get_visible_ticket(current_user, ticket_id)
        comments = self.comments.list_by_ticket_id(ticket.id)
        return [self._to_response(comment) for comment in comments]

    def add_comment(
        self, current_user: User, ticket_id: UUID, payload: CommentCreateRequest
    ) -> CommentResponse:
        ticket = self._get_visible_ticket(current_user, ticket_id)
        comment = self.comments.create(
            ticket_id=ticket.id,
            message=payload.message,
            created_by_id=current_user.id,
        )
        return self._to_response(comment)

    def _get_visible_ticket(self, current_user: User, ticket_id: UUID) -> Ticket:
        ticket = self.tickets.get_by_id(ticket_id)
        if ticket is None or not self._can_view(current_user, ticket):
            raise NotFoundError("Ticket not found")
        return ticket

    def _can_view(self, current_user: User, ticket: Ticket) -> bool:
        if current_user.role in {UserRole.ADMIN, UserRole.AGENT}:
            return True
        return ticket.created_by_id == current_user.id or ticket.assigned_to_id == current_user.id

    def _to_response(self, comment) -> CommentResponse:
        return CommentResponse.model_validate(
            {
                "id": comment.id,
                "ticket_id": comment.ticket_id,
                "message": comment.message,
                "created_by": {
                    "id": comment.author.id,
                    "name": comment.author.name,
                },
                "created_at": comment.created_at,
            }
        )
