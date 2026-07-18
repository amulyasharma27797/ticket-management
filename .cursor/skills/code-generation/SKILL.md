---
name: code-generation
description: Generate new code following project architecture and senior engineering standards. Use when implementing features, scaffolding modules, or writing new backend/frontend code.
---

# Code Generation

Generate production-quality code that fits this codebase.

## Goals

- Follow existing patterns and project rules (read before writing)
- Match Clean Architecture on backend; TanStack Query + api layer on frontend
- Minimal scope — only what the task requires
- Type-safe (TypeScript strict, Pydantic schemas)
- Include tests when adding or changing behavior
- Consistent error handling and API response envelope

## Before Generating Code

1. Read `.cursor/rules/project-overview.mdc` and the relevant stack rule (`backend-standards` or `frontend-standards`).
2. Explore similar existing files and mirror their structure.
3. Confirm which implementation phase the work belongs to.

## Backend Checklist

- [ ] Router delegates to service; service delegates to repository
- [ ] Pydantic schemas for request/response; no raw ORM in responses
- [ ] RBAC and business rules in service layer
- [ ] Errors mapped to standard envelope
- [ ] Integration test for new endpoints
- [ ] Ruff passes: `./scripts/lint.sh --python`

## Frontend Checklist

- [ ] API function in `src/api/`; hook in `src/hooks/` if needed
- [ ] Loading, error, and empty states in UI
- [ ] Types aligned with backend schemas
- [ ] Component test for non-trivial UI logic
- [ ] ESLint passes: `./scripts/lint.sh --js`

## Anti-Patterns to Avoid

- New dependencies without justification
- Business logic in routers or React components
- Hardcoded secrets or config
- Skipping validation or auth checks
- Large files when a focused module suffices

## Output

When delivering generated code, briefly state:
- What was added and why
- Which files were created or modified
- How to test the change
