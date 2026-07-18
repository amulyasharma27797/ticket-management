---
name: git-commit-messages
description: Generate Conventional Commit messages from staged changes or diffs. Use when the user asks for a commit message, conventional commit, or help committing changes. Always run lint checks before generating the message.
---

# Git Commit Messages

Generate Conventional Commit messages.

## Format

```
<type>(<scope>): <summary>
```

## Types

- feat
- fix
- refactor
- docs
- style
- test
- perf
- build
- ci
- chore

## Rules

- Imperative mood
- Max 72 characters
- No trailing period
- Include breaking change footer if applicable
- Add a short body only if necessary

## Workflow

1. **Run lint first (required):** `./scripts/lint.sh --staged` — fix all failures before proceeding. If auto-fixable, run `./scripts/lint.sh --staged --fix` then re-check.
2. **For phase commits:** verify phase tests pass (see `phase-completion` skill) before generating the message.
3. Run `git diff --staged` (or `git diff` if nothing staged) to understand the change.
4. Pick the type and scope that best match the primary intent.
5. Write the summary in imperative mood (e.g. "add auth endpoint" not "added auth endpoint").
6. Add a body only when the summary alone is insufficient.
7. If the change breaks API or config contracts, add footer:

```
BREAKING CHANGE: <description of what broke and migration path>
```

## Scope Examples (this project)

- `auth`, `tickets`, `comments`, `frontend`, `backend`, `docker`, `migrations`, `ci`

## Examples

```
feat(auth): add JWT login and refresh token endpoints
```

```
fix(tickets): reject invalid status transitions with 400
```

```
test(state-machine): parametrize all invalid transition cases
```

```
chore(docker): add postgres healthcheck to compose file
```

## Lint Integration

- Python: Ruff (`ruff-lint` skill)
- JS/TS: ESLint (`eslint-check` skill)
- Never generate a commit message while lint checks are failing.
