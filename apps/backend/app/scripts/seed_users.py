"""Seed default users when SEED_USERS=true."""

from app.core.config import settings
from app.core.security import hash_password
from app.core.seed_accounts import SEED_ACCOUNTS
from app.database.session import SessionLocal
from app.repositories.user_repository import UserRepository


def seed_users() -> None:
    if not settings.seed_users:
        return

    db = SessionLocal()
    try:
        users = UserRepository(db)
        password_hash = hash_password(settings.seed_user_password)
        for name, email, role in SEED_ACCOUNTS:
            if users.get_by_email(email) is None:
                users.create(name=name, email=email, password_hash=password_hash, role=role)
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
