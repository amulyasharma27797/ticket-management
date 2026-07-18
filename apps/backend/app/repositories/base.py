from typing import TypeVar
from uuid import UUID

from sqlalchemy.orm import Session

from app.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository[ModelT: Base]:
    def __init__(self, db: Session, model: type[ModelT]) -> None:
        self.db = db
        self.model = model

    def get(self, entity_id: UUID) -> ModelT | None:
        return self.db.get(self.model, entity_id)
