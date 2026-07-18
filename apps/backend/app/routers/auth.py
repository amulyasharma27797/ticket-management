from fastapi import APIRouter, Depends, Response, status

from app.core.deps import get_auth_service, get_current_user
from app.core.responses import success_response
from app.models.user import User
from app.schemas.auth import LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> dict:
    tokens = auth_service.register(payload)
    return success_response(tokens.model_dump(by_alias=True))


@router.post("/login")
def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> dict:
    tokens = auth_service.login(payload)
    return success_response(tokens.model_dump(by_alias=True))


@router.post("/refresh")
def refresh_tokens(
    payload: RefreshRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> dict:
    tokens = auth_service.refresh(payload)
    return success_response(tokens.model_dump(by_alias=True, exclude_none=True))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    payload: LogoutRequest,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
) -> Response:
    auth_service.logout(current_user, payload.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me")
def me(current_user: User = Depends(get_current_user)) -> dict:
    user = UserResponse.model_validate(current_user)
    return success_response(user.model_dump(by_alias=True))
