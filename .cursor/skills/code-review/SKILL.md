---
name: code-review
description: Review code changes like a senior engineer for bugs, security, performance, and maintainability. Use when reviewing PRs, diffs, or when the user asks for a code review.
---

# Code Review

Review the current changes like a senior engineer.

## Focus on

- Bugs
- Security
- Performance
- Readability
- Maintainability
- Edge cases
- API design
- Error handling
- Test coverage

Suggest improvements with code examples where useful.

## Workflow

1. Run `./scripts/lint.sh --staged` (or full `./scripts/lint.sh` for large changes) — note result in review.
2. Read the full diff and surrounding context (not just changed lines).
3. Trace happy path and failure paths for each change.
4. Check alignment with project rules: Clean Architecture, API envelope, RBAC, state machine.
5. Verify tests exist and cover edge cases.
6. Prioritize findings by severity.

## Output Format

```markdown
## Summary

<overall assessment: approve / request changes / comment>

## Critical

- <issue> — <why it matters> — <suggested fix with code if helpful>

## Suggestions

- <improvement>

## Nitpicks

- <optional polish>

## What's good

- <positive observations>
```

## Project-Specific Checks

- State transitions validated in service layer, not only frontend.
- API errors use consistent envelope (`success`, `error.code`, `error.details`).
- No secrets, hardcoded credentials, or ORM models leaked in responses.
- Migrations are additive; no editing of already-applied revision files.
- Frontend uses TanStack Query for server state; errors surfaced to users.
- Ruff and ESLint pass (`./scripts/lint.sh`).

## Severity Guide

| Level | Meaning |
|-------|---------|
| Critical | Must fix — bugs, security holes, data loss risk |
| Suggestion | Should consider — design, performance, missing tests |
| Nitpick | Optional — naming, style, minor readability |
