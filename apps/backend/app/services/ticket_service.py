from math import ceil
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, NotFoundError, TicketNotEditableError
from app.models.enums import TicketPriority, TicketStatus, UserRole
from app.models.ticket import Ticket
from app.models.user import User
from app.repositories.ticket_repository import TicketRepository
from app.repositories.user_repository import UserRepository
from app.schemas.ticket import (
    TicketAssignRequest,
    TicketCreateRequest,
    TicketDescriptionUpdateRequest,
    TicketPriorityUpdateRequest,
    TicketResponse,
    TicketStatusUpdateRequest,
    TicketTitleUpdateRequest,
)
from app.services.ticket_state_machine import validate_status_transition

TERMINAL_STATUSES = {TicketStatus.CLOSED, TicketStatus.CANCELLED}


class TicketService:
    def __init__(self, db: Session) -> None:
        self.tickets = TicketRepository(db)
        self.users = UserRepository(db)

    def create_ticket(self, current_user: User, payload: TicketCreateRequest) -> TicketResponse:
        ticket = self.tickets.create(
            title=payload.title,
            description=payload.description,
            priority=payload.priority,
            created_by_id=current_user.id,
        )
        return self._to_response(ticket)

    def get_ticket(self, current_user: User, ticket_id: UUID) -> TicketResponse:
        ticket = self._get_visible_ticket(current_user, ticket_id)
        return self._to_response(ticket)

    def list_tickets(
        self,
        current_user: User,
        *,
        page: int = 1,
        page_size: int = 50,
        search: str | None = None,
        status: TicketStatus | None = None,
        priority: TicketPriority | None = None,
    ) -> tuple[list[TicketResponse], dict[str, int]]:
        limit = min(page_size, 100)
        offset = (page - 1) * limit
        tickets, total = self.tickets.list_visible(
            current_user,
            limit=limit,
            offset=offset,
            search=search,
            status=status,
            priority=priority,
        )
        total_pages = ceil(total / limit) if total else 0
        meta = {
            "page": page,
            "pageSize": limit,
            "total": total,
            "totalPages": total_pages,
        }
        return [self._to_response(ticket) for ticket in tickets], meta

    def update_title(
        self, current_user: User, ticket_id: UUID, payload: TicketTitleUpdateRequest
    ) -> TicketResponse:
        ticket = self._get_editable_ticket(current_user, ticket_id)
        ticket.title = payload.title
        return self._to_response(self.tickets.save(ticket))

    def update_description(
        self, current_user: User, ticket_id: UUID, payload: TicketDescriptionUpdateRequest
    ) -> TicketResponse:
        ticket = self._get_editable_ticket(current_user, ticket_id)
        ticket.description = payload.description
        return self._to_response(self.tickets.save(ticket))

    def update_priority(
        self, current_user: User, ticket_id: UUID, payload: TicketPriorityUpdateRequest
    ) -> TicketResponse:
        ticket = self._get_editable_ticket(current_user, ticket_id)
        ticket.priority = payload.priority
        return self._to_response(self.tickets.save(ticket))

    def update_status(
        self, current_user: User, ticket_id: UUID, payload: TicketStatusUpdateRequest
    ) -> TicketResponse:
        if current_user.role not in {UserRole.ADMIN, UserRole.AGENT}:
            raise ForbiddenError("Only admins and agents can change ticket status")

        ticket = self._get_visible_ticket(current_user, ticket_id)
        validate_status_transition(ticket.status, payload.status)
        ticket.status = payload.status
        return self._to_response(self.tickets.save(ticket))

    def assign_ticket(
        self, current_user: User, ticket_id: UUID, payload: TicketAssignRequest
    ) -> TicketResponse:
        if current_user.role == UserRole.USER:
            raise ForbiddenError("Only agents and admins can reassign tickets")

        ticket = self._get_editable_ticket(current_user, ticket_id, allow_assignee=True)

        if payload.assigned_to_id is not None:
            assignee = self.users.get_by_id(payload.assigned_to_id)
            if assignee is None:
                raise NotFoundError("Assignee not found")
            if assignee.role not in {UserRole.AGENT, UserRole.ADMIN}:
                raise ForbiddenError("Tickets can only be assigned to agents or admins")

        ticket.assigned_to_id = payload.assigned_to_id
        return self._to_response(self.tickets.save(ticket))

    def _get_visible_ticket(self, current_user: User, ticket_id: UUID) -> Ticket:
        ticket = self.tickets.get_by_id(ticket_id)
        if ticket is None or not self._can_view(current_user, ticket):
            raise NotFoundError("Ticket not found")
        return ticket

    def _get_editable_ticket(
        self, current_user: User, ticket_id: UUID, *, allow_assignee: bool = False
    ) -> Ticket:
        ticket = self._get_visible_ticket(current_user, ticket_id)
        self._ensure_editable(ticket)
        if not self._can_edit(current_user, ticket, allow_assignee=allow_assignee):
            raise ForbiddenError("You do not have permission to edit this ticket")
        return ticket

    def _can_view(self, current_user: User, ticket: Ticket) -> bool:
        if current_user.role in {UserRole.ADMIN, UserRole.AGENT}:
            return True
        return ticket.created_by_id == current_user.id or ticket.assigned_to_id == current_user.id

    def _can_edit(
        self, current_user: User, ticket: Ticket, *, allow_assignee: bool = False
    ) -> bool:
        if current_user.role in {UserRole.ADMIN, UserRole.AGENT}:
            return True
        if allow_assignee:
            return False
        return ticket.created_by_id == current_user.id

    def _ensure_editable(self, ticket: Ticket) -> None:
        if ticket.status in TERMINAL_STATUSES:
            raise TicketNotEditableError()

    def _to_response(self, ticket: Ticket) -> TicketResponse:
        comment_count = self.tickets.get_comment_count(ticket.id)
        return TicketResponse.model_validate(
            {
                "id": ticket.id,
                "title": ticket.title,
                "description": ticket.description,
                "priority": ticket.priority,
                "status": ticket.status,
                "assigned_to_id": ticket.assigned_to_id,
                "created_by_id": ticket.created_by_id,
                "created_at": ticket.created_at,
                "updated_at": ticket.updated_at,
                "comment_count": comment_count,
            }
        )
