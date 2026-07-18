---
name: eslint-check
description: Run ESLint on TypeScript and JavaScript files in apps/frontend. Use automatically before commits, pushes, or when editing frontend code. Use when the user asks to lint JS/TS, run eslint, fix frontend style, or before generating commit messages.
---

# ESLint Check (Frontend)

Run ESLint for JS/TS/TSX files in `apps/frontend`.

## When to Run (automatic)

Run **before**:
- Generating commit messages
- Creating commits or pushes
- Completing any frontend code change

## Commands

```bash
# Lint all frontend files
./scripts/lint.sh --js

# Lint only staged frontend files
./scripts/lint.sh --js --staged

# Auto-fix
./scripts/lint.sh --js --fix

# Direct eslint (from apps/frontend)
cd apps/frontend && npm run lint
cd apps/frontend && npm run lint:fix
```

## Config

- `apps/frontend/eslint.config.js` — flat config (ESLint 9)
- Plugins: typescript-eslint, react-hooks, react-refresh
- Max warnings: 0

## Workflow

1. Ensure deps installed: `cd apps/frontend && npm install`
2. Run `./scripts/lint.sh --js` (or `--staged` before commit).
3. If failures: run `./scripts/lint.sh --js --fix` for auto-fixable issues.
4. Fix remaining errors manually.
5. Re-run until clean before committing.

## Integration

- Pre-commit hook: `./scripts/lint.sh --staged` (Python + JS)
- Pre-push hook: `./scripts/lint.sh` (full)
- Always run lint before generating commit messages (see `git-commit-messages` skill).
