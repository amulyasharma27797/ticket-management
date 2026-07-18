from datetime import UTC, datetime
from uuid import uuid4

from app.models.enums import TicketPriority, TicketStatus
from app.schemas.ticket import TicketResponse
from app.utils.csv_export import CSV_HEADERS, format_tickets_csv


def _sample_ticket(**overrides) -> TicketResponse:
    now = datetime(2026, 7, 18, 12, 0, tzinfo=UTC)
    defaults = {
        "id": uuid4(),
        "title": "Login issue",
        "description": "User cannot sign in after password reset.",
        "priority": TicketPriority.HIGH,
        "status": TicketStatus.OPEN,
        "assigned_to_id": None,
        "created_by_id": uuid4(),
        "created_at": now,
        "updated_at": now,
        "comment_count": 2,
    }
    defaults.update(overrides)
    return TicketResponse.model_validate(defaults)


def test_format_tickets_csv_includes_headers_and_row() -> None:
    ticket = _sample_ticket(title="Broken printer", description="Office printer is offline.")

    csv_text = format_tickets_csv([ticket])
    lines = csv_text.strip().splitlines()

    assert lines[0] == ",".join(CSV_HEADERS)
    assert "Broken printer" in lines[1]
    assert "Office printer is offline." in lines[1]
    assert ",open,high," in lines[1]


def test_format_tickets_csv_escapes_formula_injection() -> None:
    ticket = _sample_ticket(title="=1+1", description="+cmd|'/c calc'!A0")

    csv_text = format_tickets_csv([ticket])

    assert "'=1+1" in csv_text
    assert "'+cmd|'/c calc'!A0" in csv_text


def test_format_tickets_csv_empty_list_returns_headers_only() -> None:
    csv_text = format_tickets_csv([])

    assert csv_text.strip() == ",".join(CSV_HEADERS)
