import pytest

from app.core.exceptions import InvalidStatusTransitionError
from app.models.enums import TicketStatus
from app.services.ticket_state_machine import get_allowed_transitions, validate_status_transition


@pytest.mark.parametrize(
    ("current", "new_status"),
    [
        (TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
        (TicketStatus.OPEN, TicketStatus.CANCELLED),
        (TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED),
        (TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED),
        (TicketStatus.RESOLVED, TicketStatus.CLOSED),
        (TicketStatus.RESOLVED, TicketStatus.CANCELLED),
    ],
)
def test_validate_status_transition_allows_valid_moves(
    current: TicketStatus, new_status: TicketStatus
) -> None:
    validate_status_transition(current, new_status)


@pytest.mark.parametrize(
    ("current", "new_status"),
    [
        (TicketStatus.OPEN, TicketStatus.RESOLVED),
        (TicketStatus.OPEN, TicketStatus.CLOSED),
        (TicketStatus.IN_PROGRESS, TicketStatus.OPEN),
        (TicketStatus.IN_PROGRESS, TicketStatus.CLOSED),
        (TicketStatus.RESOLVED, TicketStatus.OPEN),
        (TicketStatus.CLOSED, TicketStatus.OPEN),
        (TicketStatus.CANCELLED, TicketStatus.IN_PROGRESS),
    ],
)
def test_validate_status_transition_rejects_invalid_moves(
    current: TicketStatus, new_status: TicketStatus
) -> None:
    with pytest.raises(InvalidStatusTransitionError):
        validate_status_transition(current, new_status)


def test_get_allowed_transitions_open() -> None:
    assert get_allowed_transitions(TicketStatus.OPEN) == [
        TicketStatus.CANCELLED,
        TicketStatus.IN_PROGRESS,
    ]
