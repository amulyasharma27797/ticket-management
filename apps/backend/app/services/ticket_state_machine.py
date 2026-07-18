from app.core.exceptions import InvalidStatusTransitionError
from app.models.enums import TicketStatus

ALLOWED_TRANSITIONS: dict[TicketStatus, frozenset[TicketStatus]] = {
    TicketStatus.OPEN: frozenset({TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED}),
    TicketStatus.IN_PROGRESS: frozenset({TicketStatus.RESOLVED, TicketStatus.CANCELLED}),
    TicketStatus.RESOLVED: frozenset({TicketStatus.CLOSED, TicketStatus.CANCELLED}),
    TicketStatus.CLOSED: frozenset(),
    TicketStatus.CANCELLED: frozenset(),
}


def get_allowed_transitions(current: TicketStatus) -> list[TicketStatus]:
    return sorted(ALLOWED_TRANSITIONS.get(current, frozenset()), key=lambda status: status.value)


def validate_status_transition(current: TicketStatus, new_status: TicketStatus) -> None:
    if current == new_status:
        return

    allowed = ALLOWED_TRANSITIONS.get(current, frozenset())
    if new_status not in allowed:
        raise InvalidStatusTransitionError(
            f"Cannot transition ticket from '{current.value}' to '{new_status.value}'"
        )
