from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import TicketPriority, TicketStatus


class TicketCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    priority: TicketPriority = TicketPriority.MEDIUM

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        return value.strip()

    @field_validator("description")
    @classmethod
    def strip_description(cls, value: str) -> str:
        return value.strip()


class TicketTitleUpdateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        return value.strip()


class TicketDescriptionUpdateRequest(BaseModel):
    description: str = Field(min_length=10, max_length=5000)

    @field_validator("description")
    @classmethod
    def strip_description(cls, value: str) -> str:
        return value.strip()


class TicketPriorityUpdateRequest(BaseModel):
    priority: TicketPriority


class TicketStatusUpdateRequest(BaseModel):
    status: TicketStatus


class TicketAssignRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    assigned_to_id: UUID | None = Field(default=None, alias="assignedToId")


class TicketStatsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total: int
    by_status: dict[str, int] = Field(serialization_alias="byStatus")
    by_priority: dict[str, int] = Field(serialization_alias="byPriority")


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    title: str
    description: str
    priority: TicketPriority
    status: TicketStatus
    assigned_to_id: UUID | None = Field(serialization_alias="assignedToId")
    created_by_id: UUID = Field(serialization_alias="createdById")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")
    comment_count: int = Field(default=0, serialization_alias="commentCount")
