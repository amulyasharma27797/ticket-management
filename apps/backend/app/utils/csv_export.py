import csv
import io
from datetime import datetime
from uuid import UUID

from app.schemas.ticket import TicketResponse

CSV_HEADERS = [
    "id",
    "title",
    "description",
    "status",
    "priority",
    "assigned_to_id",
    "created_at",
    "updated_at",
    "comment_count",
]


def _sanitize_csv_cell(value: str) -> str:
    if value and value[0] in ("=", "+", "-", "@", "\t", "\r"):
        return f"'{value}"
    return value


def _format_value(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    return _sanitize_csv_cell(str(value))


def format_tickets_csv(tickets: list[TicketResponse]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(CSV_HEADERS)

    for ticket in tickets:
        writer.writerow(
            [
                _format_value(ticket.id),
                _format_value(ticket.title),
                _format_value(ticket.description),
                _format_value(ticket.status.value),
                _format_value(ticket.priority.value),
                _format_value(ticket.assigned_to_id),
                _format_value(ticket.created_at),
                _format_value(ticket.updated_at),
                _format_value(ticket.comment_count),
            ]
        )

    return buffer.getvalue()
