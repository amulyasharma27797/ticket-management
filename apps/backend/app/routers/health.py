from fastapi import APIRouter
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.responses import success_response
from app.database.session import engine

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> dict:
    return success_response({"status": "ok"})


@router.get("/ready")
def readiness() -> dict:
    db_status = "disconnected"
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        db_status = "connected"
    except SQLAlchemyError:
        db_status = "disconnected"

    return success_response({"status": "ok", "db": db_status})
