from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.responses import success_response
from app.models.enums import TicketPriority, TicketStatus
from app.models.user import User
from app.schemas.ticket import (
    TicketAssignRequest,
    TicketCreateRequest,
    TicketDescriptionUpdateRequest,
    TicketPriorityUpdateRequest,
    TicketStatusUpdateRequest,
    TicketTitleUpdateRequest,
)
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/tickets", tags=["tickets"])


def get_ticket_service(db: Session = Depends(get_db)) -> TicketService:
    return TicketService(db)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: TicketCreateRequest,
    current_user: User = Depends(get_current_user),
    ticket_service: TicketService = Depends(get_ticket_service),
) -> dict:
    ticket = ticket_service.create_ticket(current_user, payload)
    return success_response(ticket.model_dump(by_alias=True))


@router.get("")
def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100, alias="pageSize"),
    search: str | None = Query(None, max_length=200),
    status: TicketStatus | None = None,
    priority: TicketPriority | None = None,
    current_user: User = Depends(get_current_user),
    ticket_service: TicketService = Depends(get_ticket_service),
) -> dict:
    tickets, meta = ticket_service.list_tickets(
        current_user,
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        priority=priority,
    )
    return success_response(
        [ticket.model_dump(by_alias=True) for ticket in tickets],
        meta=meta,
    )


@router.get("/{ticket_id}")
def get_ticket(
    ticket_id: UUID,
    current_user: User = Depends(get_current_user),
    ticket_service: TicketService = Depends(get_ticket_service),
) -> dict:
    ticket = ticket_service.get_ticket(current_user, ticket_id)
    return success_response(ticket.model_dump(by_alias=True))


@router.patch("/{ticket_id}/title")
def update_ticket_title(
    ticket_id: UUID,
    payload: TicketTitleUpdateRequest,
    current_user: User = Depends(get_current_user),
    ticket_service: TicketService = Depends(get_ticket_service),
) -> dict:
    ticket = ticket_service.update_title(current_user, ticket_id, payload)
    return success_response(ticket.model_dump(by_alias=True))


@router.patch("/{ticket_id}/description")
def update_ticket_description(
    ticket_id: UUID,
    payload: TicketDescriptionUpdateRequest,
    current_user: User = Depends(get_current_user),
    ticket_service: TicketService = Depends(get_ticket_service),
) -> dict:
    ticket = ticket_service.update_description(current_user, ticket_id, payload)
    return success_response(ticket.model_dump(by_alias=True))


@router.patch("/{ticket_id}/priority")
def update_ticket_priority(
    ticket_id: UUID,
    payload: TicketPriorityUpdateRequest,
    current_user: User = Depends(get_current_user),
    ticket_service: TicketService = Depends(get_ticket_service),
) -> dict:
    ticket = ticket_service.update_priority(current_user, ticket_id, payload)
    return success_response(ticket.model_dump(by_alias=True))


@router.patch("/{ticket_id}/status")
def update_ticket_status(
    ticket_id: UUID,
    payload: TicketStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    ticket_service: TicketService = Depends(get_ticket_service),
) -> dict:
    ticket = ticket_service.update_status(current_user, ticket_id, payload)
    return success_response(ticket.model_dump(by_alias=True))


@router.patch("/{ticket_id}/assign")
def assign_ticket(
    ticket_id: UUID,
    payload: TicketAssignRequest,
    current_user: User = Depends(get_current_user),
    ticket_service: TicketService = Depends(get_ticket_service),
) -> dict:
    ticket = ticket_service.assign_ticket(current_user, ticket_id, payload)
    return success_response(ticket.model_dump(by_alias=True))
