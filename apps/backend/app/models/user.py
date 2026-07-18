from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import UserRole, enum_values


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            native_enum=True,
            create_constraint=True,
            values_callable=enum_values,
        ),
        nullable=False,
        default=UserRole.USER,
    )

    created_tickets = relationship(
        "Ticket", back_populates="creator", foreign_keys="Ticket.created_by_id"
    )
    assigned_tickets = relationship(
        "Ticket", back_populates="assignee", foreign_keys="Ticket.assigned_to_id"
    )
    comments = relationship("Comment", back_populates="author")
    sessions = relationship("AuthSession", back_populates="user")
