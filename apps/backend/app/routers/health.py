from fastapi import APIRouter
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.responses import success_response

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health() -> dict:
    return success_response({"status": "ok"})


@router.get("/ready")
def readiness() -> dict:
    db_status = "disconnected"
    try:
        engine = create_engine(settings.database_url, pool_pre_ping=True)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        db_status = "connected"
    except SQLAlchemyError:
        db_status = "disconnected"

    return success_response({"status": "ok", "db": db_status})
