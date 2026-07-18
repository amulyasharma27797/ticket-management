from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.responses import success_response
from app.models.user import User
from app.schemas.comment import CommentCreateRequest
from app.services.comment_service import CommentService

router = APIRouter(prefix="/tickets/{ticket_id}/comments", tags=["comments"])


def get_comment_service(db: Session = Depends(get_db)) -> CommentService:
    return CommentService(db)


@router.get("")
def list_comments(
    ticket_id: UUID,
    current_user: User = Depends(get_current_user),
    comment_service: CommentService = Depends(get_comment_service),
) -> dict:
    comments = comment_service.list_comments(current_user, ticket_id)
    return success_response([comment.model_dump(by_alias=True) for comment in comments])


@router.post("", status_code=status.HTTP_201_CREATED)
def add_comment(
    ticket_id: UUID,
    payload: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    comment_service: CommentService = Depends(get_comment_service),
) -> dict:
    comment = comment_service.add_comment(current_user, ticket_id, payload)
    return success_response(comment.model_dump(by_alias=True))
