from app.models.enums import UserRole

SEED_ACCOUNTS: list[tuple[str, str, UserRole]] = [
    ("Admin User", "admin@example.com", UserRole.ADMIN),
    ("Agent User", "agent@example.com", UserRole.AGENT),
    ("Regular User", "user@example.com", UserRole.USER),
]

DEFAULT_SEED_EMAILS = frozenset(email for _, email, _ in SEED_ACCOUNTS)


def is_default_seed_email(email: str) -> bool:
    return email in DEFAULT_SEED_EMAILS
