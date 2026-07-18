# Support Ticket Management System

A production-ready monorepo for managing support tickets — built with React, FastAPI, PostgreSQL, and Docker Compose.

## Features

- User authentication (JWT + persistent sessions)
- Ticket CRUD with priority, status, and assignment
- Comments on tickets
- Search, filter, and paginated ticket listing
- Server-enforced ticket state machine
- CSV export of self-created tickets
- Responsive UI with dark mode
- Role-based access control (admin, agent, user)

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, TypeScript, TailwindCSS, shadcn/ui, React Router, TanStack Query |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Database | PostgreSQL 16 |
| Infrastructure | Docker Compose |
| Linting | Ruff (Python), ESLint 9 (JS/TS) |
| Testing | pytest, Vitest, Playwright (optional) |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- Python 3.12 + pip (only if running the backend locally outside Docker)
- Node.js 20+ (only if running the frontend locally outside Docker)

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd ticket-management

# 2. Configure environment
cp .env.example .env
# Edit .env — set passwords and SECRET_KEY (never commit .env)

# 3. Set up harness and linting (one-time)
cp harness.example harness && chmod +x harness
cp harness.config.example harness.config
chmod +x scripts/lint.sh scripts/setup-githooks.sh
./scripts/setup-githooks.sh
pip install ruff
cd apps/frontend && npm install && cd ../..

# 4. Start all services
docker compose up --build          # full Docker stack
# OR
./harness up                       # native BE + FE with hot-reload (preset: local)
```

Once running (after Phase 0 implementation):

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/v1 |
| Swagger docs | http://localhost:8000/api/v1/docs |

## Project Structure

```
ticket-management/
├── apps/
│   ├── frontend/          # React SPA
│   └── backend/           # FastAPI API (Clean Architecture)
├── docker/                # Dockerfiles and Postgres init scripts
├── migrations/            # Alembic schema migrations (version-controlled)
│   └── versions/
├── .cursor/               # Cursor rules and agent skills
├── docker-compose.yml
├── alembic.ini
├── harness.example        # Template for local dev orchestrator (copy to ./harness)
├── harness.config.example # Preset configs for harness
├── scripts/
│   ├── lint.sh            # Ruff + ESLint runner
│   └── setup-githooks.sh  # Install pre-commit/pre-push hooks
├── .githooks/             # Git hook templates (pre-commit, pre-push)
├── pyproject.toml         # Ruff + pytest config
├── .env.example
└── README.md
```

> `./harness` and `harness.config` are **gitignored** — local infra only. Copy from the `.example` files.

### Backend Layers

```
routers → services → repositories → models
```

Business rules (state machine, authorization, CSV export) live in the **service layer**.

## Environment Variables

Copy `.env.example` to `.env` and update values. Never commit `.env`.

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `ticket_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `change_me` |
| `POSTGRES_DB` | Database name | `ticket_db` |
| `DATABASE_URL` | SQLAlchemy connection string | — |
| `SECRET_KEY` | JWT signing key | `generate_a_long_random_string` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL | `7` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |
| `SEED_USERS` | Seed default users on startup | `true` |
| `SEED_USER_PASSWORD` | Password for seeded users | `change_me` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:8000/api/v1` |
| `BACKEND_PORT` | Host port for backend (Docker) | `8000` |
| `FRONTEND_PORT` | Host port for frontend (Docker) | `5173` |

## Development

### Harness (local BE + FE together)

`./harness` is a repo-root command for running backend and frontend **simultaneously** during local development. It is gitignored — each developer copies and customizes their own copy.

```bash
# One-time setup
cp harness.example harness && chmod +x harness
cp harness.config.example harness.config

# Commands
./harness up              # Start BE + FE (default preset: local)
./harness down            # Stop all managed processes
./harness restart         # Restart BE + FE
./harness rebuild         # Reinstall deps and restart (be|fe|all)
./harness smoke           # Health checks against running stack
./harness status          # Show service status
./harness fe start        # Frontend lifecycle (start|stop|restart|install|logs)
./harness be start        # Backend lifecycle (start|stop|restart|install|logs)
./harness preset docker   # Switch preset: local | hybrid | docker
```

**Presets** (configured in `harness.config`):

| Preset | Behavior |
|--------|----------|
| `local` | Postgres in Docker; BE + FE run natively with hot-reload |
| `hybrid` | Same as `local` |
| `docker` | Full stack via `docker compose up --build` |

Runtime state (PIDs, logs) is stored in `.harness/` (also gitignored).

### Docker (recommended for parity)

```bash
docker compose up --build          # start all services (hot reload enabled by default)
docker compose exec backend pytest # run backend tests
```

**Hot reload:** Source is mounted into the containers, so code edits apply without rebuilding.

| Service  | Behavior on save |
|----------|------------------|
| Frontend | Vite HMR updates the browser instantly |
| Backend  | Uvicorn reloads the API process (`UVICORN_RELOAD=true` in `.env`) |

Rebuild only when dependencies change (`requirements.txt`, `package.json`):

```bash
docker compose up --build
```

Set `UVICORN_RELOAD=false` in `.env` to disable backend auto-reload.

### Local backend (optional, without harness)

```bash
cd apps/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

### Local frontend (optional)

```bash
cd apps/frontend
npm install
npm run dev
```

### Database migrations

```bash
# Create a new migration (after Phase 1)
docker compose exec backend alembic -c alembic.ini revision --autogenerate -m "description"

# Apply migrations
docker compose exec backend alembic -c alembic.ini upgrade head
```

See [migrations/README.md](migrations/README.md) for conventions and changelog.

## Linting

| Language | Tool | Config |
|----------|------|--------|
| Python | Ruff (lint + format) | `pyproject.toml` |
| JS/TS/TSX | ESLint 9 | `apps/frontend/eslint.config.js` |

### Setup (one-time)

```bash
chmod +x scripts/lint.sh scripts/setup-githooks.sh
./scripts/setup-githooks.sh          # install pre-commit + pre-push hooks
pip install ruff                     # or: pip install -r apps/backend/requirements-dev.txt
cd apps/frontend && npm install
```

### Commands

```bash
./scripts/lint.sh              # lint all Python + frontend
./scripts/lint.sh --staged     # lint staged files only (pre-commit)
./scripts/lint.sh --fix        # auto-fix where possible
./scripts/lint.sh --python     # ruff only
./scripts/lint.sh --js         # eslint only
```

Lint runs **automatically** via git hooks:
- **pre-commit** — staged files (`./scripts/lint.sh --staged`)
- **pre-push** — full lint (`./scripts/lint.sh`)

Cursor also runs lint before `git commit` and `git push` via `.cursor/hooks.json`.

## Testing

```bash
# Backend
docker compose exec backend pytest
docker compose exec backend pytest --cov=app --cov-report=term-missing

# Frontend
cd apps/frontend && npm test
```

Tests are added incrementally per implementation phase. State machine transitions require parametrized integration tests (valid and invalid).

## Ticket State Machine

Allowed status transitions (enforced server-side):

```
open        → in_progress, cancelled
in_progress → resolved, cancelled
resolved    → closed, cancelled
closed      → (terminal)
cancelled   → (terminal)
```

All other transitions return `400 INVALID_STATUS_TRANSITION`.

## Default Seeded Users

Available after Phase 2 (password from `SEED_USER_PASSWORD` in `.env`):

| Email | Role |
|-------|------|
| admin@example.com | admin |
| agent@example.com | agent |
| user@example.com | user |

## Implementation Roadmap

The project is built in incremental phases (0–10). Each phase leaves the application in a working, testable state.

### Phase status

| Phase | Status | Branch | Notes |
|-------|--------|--------|-------|
| **0** | **Complete** | `cursor/phase-0-scaffold` | Docker Compose, health endpoints, React scaffold — verified locally |
| **1** | **Complete** | `cursor/phase-1-database` | ORM models, Alembic migrations, Clean Architecture skeleton |
| **2** | **Complete** | `cursor/phase-2-auth` | JWT auth, login/register/logout/me, protected routes |
| **3** | **Complete** | `cursor/phase-3-ticket-crud` | Ticket CRUD — create, detail, patch fields |
| **4** | **Complete** | `cursor/phase-4-listing-search-filters` | Listing, search, filters |
| **5** | **Complete** | `cursor/phase-5-comments` | Comments on tickets |
| **6** | **Complete** | `cursor/phase-6-state-machine` | State machine + integration tests |
| **7** | **Complete** | `cursor/phase-7-dashboard-dark-mode` | Dashboard, responsive UI, dark mode |
| 8 | In progress | `cursor/phase-8-csv-export` | CSV export of self-created tickets |

**Pre-Phase 0 (done):** repo scaffold, README, `.env.example`, migrations skeleton, harness template, lint tooling, Cursor rules/skills.

**Phase 0 (complete):** `docker compose up --build` boots postgres + backend + frontend; `GET /api/v1/health` returns 200; `GET /api/v1/health/ready` reports DB connected; frontend loads and displays backend health; pytest + vitest pass.

**Phase 1 (complete):** SQLAlchemy models (`users`, `tickets`, `comments`, `sessions`) with PostgreSQL enums; Alembic auto-migrates on backend startup; integration tests verify tables and enums exist.

**Phase 2 (complete):** JWT access + refresh tokens; register/login/logout/me/refresh endpoints; seed users; frontend login/register pages with protected dashboard route.

**Phase 3 (complete):** Ticket create, detail, and patch endpoints for title/description/priority/assign/status; frontend create and detail pages with field-level validation; Kanban board with status management for admins and agents.

**Phase 4 (complete):** Server-side ticket listing with `search`, `status`, and `priority` query filters plus pagination; dashboard filter bar and debounced header search wired to the API.

**Phase 5 (complete):** Add and list comments on ticket detail via nested `/tickets/{id}/comments` endpoints.

**Phase 6 (complete):** Full parametrized state machine integration tests and terminal-state edit lock verification.

**Phase 7 (complete):** `GET /tickets/stats` for dashboard metrics, dark mode toggle with persisted theme, and mobile navigation drawer.

**Phase 8 (in progress):** `GET /tickets/export` returns a CSV of tickets created by the current user; dashboard **Export my tickets** button downloads the file.

### Changing ticket status

| UI label | API value (`status`) |
|----------|----------------------|
| Open | `open` |
| In Progress | `in_progress` |
| Pending | `resolved` |
| Completed | `closed` |
| Cancelled | `cancelled` |

**Backend:** `PATCH /api/v1/tickets/{id}/status` with body `{ "status": "in_progress" }` — admins and agents only. Transitions are validated server-side; invalid moves return `400 INVALID_STATUS_TRANSITION`.

**Frontend:**
- **Dashboard (Kanban):** admins and agents drag a ticket card to another column to change its status.
- **Ticket detail:** admins use the **Move to** dropdown and click **Save changes** to update status.

Regular users can view status but cannot change it.

| Phase | Focus |
|-------|-------|
| 0 | Docker Compose, FastAPI + React skeletons, health checks **(done)** |
| 1 | Database models, Alembic migrations **(done)** |
| 2 | Authentication (JWT, login/register/logout) **(done)** |
| 3 | Ticket CRUD **(done)** |
| 4 | Listing, search, filters **(done)** |
| 5 | Comments **(done)** |
| 6 | State machine + integration tests **(done)** |
| 7 | Dashboard, responsive UI, dark mode **(done)** |
| 8 | CSV export **(in progress)** |
| 9 | Error handling and API polish |
| 10 | CI, full test suite, production readiness |

## Phase Completion Workflow

Each phase is implemented, **tested thoroughly locally**, then **committed and pushed** before starting the next phase.

### Checklist (every phase)

```bash
# 1. Lint
./scripts/lint.sh

# 2. Backend tests
docker compose exec backend pytest -v

# 3. Frontend tests
cd apps/frontend && npm test

# 4. Boot and smoke
docker compose up --build          # or ./harness up
./harness smoke                    # optional health checks

# 5. Manual verification — exercise new features (browser or Swagger)
```

### Git workflow

| Step | Action |
|------|--------|
| Branch | `cursor/phase-N-<summary>` (e.g. `cursor/phase-2-auth`) |
| Commit | One phase per branch; conventional commit after tests pass |
| Push | `git push -u origin HEAD` — only when all local tests pass |

### Definition of Done

Each phase in the Cursor blueprint includes a **DoD** (e.g. Phase 0: `docker compose up --build` works, health endpoint returns 200). Do not push until DoD is verified.

Use the Cursor **`phase-completion`** skill for the agent checklist.

## Cursor AI Setup

This repo includes project-specific Cursor configuration:

- **Rules** (`.cursor/rules/`) — architecture, backend/frontend standards, testing, security
- **Skills** (`.cursor/skills/`) — commit messages, PR descriptions, code review, refactoring, ruff-lint, eslint-check, phase-completion
- **Hooks** (`.cursor/hooks.json`) — lint gate before git commit/push

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | Change `BACKEND_PORT` / `FRONTEND_PORT` in `.env`; also set `VITE_API_URL` to match `BACKEND_PORT` |
| Database connection refused | Wait for Postgres healthcheck; verify `DATABASE_URL` in `.env` |
| Migrations fail | Ensure `migrations/versions/` is mounted; run `alembic upgrade head` manually |
| Frontend can't reach API | Check `VITE_API_URL` matches backend port |
| Harness command not found | Run `cp harness.example harness && chmod +x harness` |
| Harness smoke fails | Ensure BE/FE are running (`./harness status`); check `.harness/logs/` |
| Lint hook blocks commit | Run `./scripts/lint.sh --staged --fix`; fix remaining errors manually |
| Git hooks not running | Run `./scripts/setup-githooks.sh` |

## License

TBD
