from itertools import product

import pytest

from app.core.exceptions import InvalidStatusTransitionError
from app.models.enums import TicketStatus
from app.services.ticket_state_machine import (
    ALLOWED_TRANSITIONS,
    get_allowed_transitions,
    validate_status_transition,
)

ALL_STATUSES = list(TicketStatus)

VALID_TRANSITIONS = [
    (current, target) for current, targets in ALLOWED_TRANSITIONS.items() for target in targets
]

INVALID_TRANSITIONS = [
    (current, target)
    for current, target in product(ALL_STATUSES, ALL_STATUSES)
    if current != target and target not in ALLOWED_TRANSITIONS.get(current, frozenset())
]


@pytest.mark.parametrize(("current", "target"), VALID_TRANSITIONS)
def test_validate_status_transition_allows_valid_moves(
    current: TicketStatus, target: TicketStatus
) -> None:
    validate_status_transition(current, target)


@pytest.mark.parametrize(("current", "target"), INVALID_TRANSITIONS)
def test_validate_status_transition_rejects_invalid_moves(
    current: TicketStatus, target: TicketStatus
) -> None:
    with pytest.raises(InvalidStatusTransitionError):
        validate_status_transition(current, target)


@pytest.mark.parametrize("status", ALL_STATUSES)
def test_validate_status_transition_allows_same_status(status: TicketStatus) -> None:
    validate_status_transition(status, status)


def test_get_allowed_transitions_open() -> None:
    assert get_allowed_transitions(TicketStatus.OPEN) == [
        TicketStatus.CANCELLED,
        TicketStatus.IN_PROGRESS,
    ]


def test_get_allowed_transitions_terminal_states() -> None:
    assert get_allowed_transitions(TicketStatus.CLOSED) == []
    assert get_allowed_transitions(TicketStatus.CANCELLED) == []
