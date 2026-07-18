# Database Migrations

Alembic migrations for the Support Ticket Management System. Schema history is version-controlled here, separate from application code.

## Layout

```
migrations/
├── versions/       # Revision files (one per schema change)
├── env.py          # Alembic runtime environment
├── script.py.mako  # Template for new revisions
└── README.md       # This file
```

Configuration: `alembic.ini` at the repo root (`script_location = migrations`).

## Conventions

| Rule | Detail |
|------|--------|
| Naming | `YYYYMMDD_NNNN_description.py` (e.g. `20260718_0001_initial_schema.py`) |
| Never edit applied migrations | Add a new revision instead |
| Data migrations | Separate revisions for seed data; passwords from env, never hardcoded |
| Review autogenerate | Always manually review `alembic revision --autogenerate` output |

## Commands

```bash
# Create a new migration
docker compose exec backend alembic -c alembic.ini revision --autogenerate -m "description"

# Apply all pending migrations
docker compose exec backend alembic -c alembic.ini upgrade head

# Roll back one revision (dev only)
docker compose exec backend alembic -c alembic.ini downgrade -1
```

## Changelog

| Revision | Date | Description | Tables |
|----------|------|-------------|--------|
| `20260718_0001` | 2026-07-18 | Initial schema | `users`, `tickets`, `comments`, `sessions` |
