---
name: ruff-lint
description: Run Ruff lint and format checks on Python files in apps/backend. Use automatically before commits, pushes, or when editing Python code. Use when the user asks to lint Python, run ruff, fix Python style, or before generating commit messages.
---

# Ruff Lint (Python)

Run Ruff for Python linting and formatting in this monorepo.

## When to Run (automatic)

Run **before**:
- Generating commit messages
- Creating commits or pushes
- Completing any Python code change

## Commands

```bash
# Lint all Python (check + format)
./scripts/lint.sh --python

# Lint only staged Python files
./scripts/lint.sh --python --staged

# Auto-fix
./scripts/lint.sh --python --fix

# Direct ruff (from repo root)
ruff check --config pyproject.toml apps/backend
ruff format --check --config pyproject.toml apps/backend
```

## Config

- `pyproject.toml` at repo root — `[tool.ruff]` section
- Target: Python 3.12, line length 100
- Rules: E, W, F, I, UP, B, SIM, RUF

## Workflow

1. Run `./scripts/lint.sh --python` (or `--staged` before commit).
2. If failures: run `./scripts/lint.sh --python --fix` for auto-fixable issues.
3. Fix remaining errors manually.
4. Re-run until clean before committing.

## Integration

- Pre-commit hook: `./scripts/lint.sh --staged` (Python + JS)
- Pre-push hook: `./scripts/lint.sh` (full)
- Always run lint before generating commit messages (see `git-commit-messages` skill).
