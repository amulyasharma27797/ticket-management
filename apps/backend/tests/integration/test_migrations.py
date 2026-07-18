from sqlalchemy import inspect, text

from app.database.session import engine

EXPECTED_TABLES = {"users", "tickets", "comments", "sessions"}
EXPECTED_ENUMS = {"user_role", "ticket_priority", "ticket_status"}


def test_tables_exist() -> None:
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    assert tables >= EXPECTED_TABLES


def test_enums_exist() -> None:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT typname FROM pg_type WHERE typtype = 'e'"))
        enum_names = {row[0] for row in result}

    assert enum_names >= EXPECTED_ENUMS
