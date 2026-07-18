import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import TicketPriority, TicketStatus, enum_values


class Ticket(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "tickets"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[TicketPriority] = mapped_column(
        Enum(
            TicketPriority,
            name="ticket_priority",
            native_enum=True,
            create_constraint=True,
            values_callable=enum_values,
        ),
        nullable=False,
        default=TicketPriority.MEDIUM,
    )
    status: Mapped[TicketStatus] = mapped_column(
        Enum(
            TicketStatus,
            name="ticket_status",
            native_enum=True,
            create_constraint=True,
            values_callable=enum_values,
        ),
        nullable=False,
        default=TicketStatus.OPEN,
        index=True,
    )
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )

    assignee = relationship(
        "User", back_populates="assigned_tickets", foreign_keys=[assigned_to_id]
    )
    creator = relationship("User", back_populates="created_tickets", foreign_keys=[created_by_id])
    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")
