---
name: phase-completion
description: Verify a development phase is complete before committing and pushing. Use when finishing a phase, before git push, or when the user asks to complete, sign off, or ship a phase.
---

# Phase Completion

Run this checklist when a development phase (0–10) is implemented. Do not commit or push until every step passes.

## Workflow

### 1. Verify scope

- [ ] Only features for the **current phase** are included (no scope creep into later phases)
- [ ] Definition of Done (DoD) from the blueprint is met for this phase

### 2. Run automated checks (local)

```bash
# Lint
./scripts/lint.sh

# Backend tests (add --cov for coverage report)
docker compose exec backend pytest -v
# OR locally: cd apps/backend && pytest -v

# Frontend tests
cd apps/frontend && npm test

# Smoke / app boots
docker compose up --build -d    # or ./harness up
./harness smoke                 # if using harness
```

- [ ] All lint checks pass
- [ ] All new and existing tests for this phase pass
- [ ] Application starts without errors (`docker compose up --build` or `./harness up`)
- [ ] Manual smoke: exercise new features in browser or via API (Swagger at `/api/v1/docs`)

### 3. Review changes

- [ ] New tests cover the phase features (see blueprint Section 15 — tests per phase)
- [ ] No secrets, `.env`, or local-only files staged (`harness`, `.harness/`, `node_modules/`, `.venv/`)
- [ ] Migrations changelog updated in `migrations/README.md` (if schema changed)

### 4. Commit

Use the `git-commit-messages` skill (lint runs first automatically).

```
feat(phase-N): <what this phase delivers>

Examples:
feat(phase-0): add docker compose scaffold and health endpoints
feat(phase-2): add JWT auth with login register and protected routes
test(phase-6): add parametrized state machine transition tests
```

Branch naming: `cursor/phase-N-<short-summary>` (e.g. `cursor/phase-2-auth`)

### 5. Push

- [ ] Push only after all local tests pass
- [ ] One phase per branch; push to remote when phase is fully verified

```bash
git push -u origin HEAD
```

## Phase Test Map (quick reference)

| Phase | Key tests to run |
|-------|------------------|
| 0 | `test_health.py`, `docker compose up --build`, frontend loads |
| 1 | `test_migrations.py`, tables exist, alembic upgrade |
| 2 | `test_auth.py`, login/register/logout/me in browser |
| 3 | `test_tickets.py` (CRUD subset) |
| 4 | `test_tickets.py` (listing/filter) |
| 5 | `test_comments.py` |
| 6 | `test_state_machine.py` (full matrix) |
| 7 | layout/stats smoke, responsive UI check |
| 8 | `test_export.py`, CSV download |
| 9 | `test_errors.py`, error envelope consistency |
| 10 | full suite, CI green, coverage gates |

## Do not

- Push with failing tests or lint errors
- Combine multiple phases in one commit unless explicitly requested
- Skip manual smoke for UI-facing phases (2, 3, 4, 7, 8)
