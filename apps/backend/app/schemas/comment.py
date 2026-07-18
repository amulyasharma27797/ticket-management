from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CommentCreateRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)

    @field_validator("message")
    @classmethod
    def strip_message(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Message cannot be empty")
        return stripped


class CommentAuthorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    name: str


class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    ticket_id: UUID = Field(serialization_alias="ticketId")
    message: str
    created_by: CommentAuthorResponse = Field(serialization_alias="createdBy")
    created_at: datetime = Field(serialization_alias="createdAt")
