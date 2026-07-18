---
name: refactoring
description: Refactor code without changing behavior. Use when the user asks to refactor, clean up, deduplicate, or improve structure without altering functionality.
---

# Refactoring

Refactor without changing behavior.

## Goals

- Remove duplication
- Improve naming
- Reduce complexity
- Follow SOLID
- Improve readability
- Preserve existing functionality

## Workflow

1. **Establish baseline** — run existing tests; note current behavior.
2. **Identify scope** — one concern per refactor (don't mix feature work).
3. **Refactor in small steps** — commit or checkpoint after each safe step.
4. **Re-run tests** after every step; stop if anything fails.
5. **No behavior changes** — same inputs must produce same outputs and HTTP status codes.

## Principles

- Extract functions/classes only when they reduce duplication or clarify intent.
- Prefer explicit over clever; match existing project naming and folder layout.
- Keep layer boundaries intact (router → service → repository).
- Do not rename public API fields or routes during a pure refactor.

## Checklist

- [ ] All existing tests still pass
- [ ] No new features or bug fixes smuggled in
- [ ] Public API contracts unchanged
- [ ] Diff is focused — no unrelated file changes

## When to Stop and Ask

- Refactor requires changing tests because behavior must change → that's a fix or feature, not a refactor.
- Refactor touches migrations or auth flows → confirm with user first.
