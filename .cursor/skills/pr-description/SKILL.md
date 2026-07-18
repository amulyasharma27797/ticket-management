---
name: pr-description
description: Generate a concise PR description in Markdown from branch changes. Use when the user asks for a pull request description, PR body, or opening a PR.
---

# PR Description

Generate a concise PR description.

## Include

- Summary
- Changes made
- Testing performed
- Screenshots (if UI changes)
- Breaking changes
- Related issues

Use Markdown.

## Workflow

1. Run `./scripts/lint.sh` — ensure lint passes before drafting the PR.
2. Inspect `git log` and `git diff` against the base branch (usually `main`).
3. Summarize the **why**, not just the **what**.
4. List concrete changes by area (backend, frontend, infra, tests).
5. Document tests run and their results (include `./scripts/lint.sh`).
6. Note breaking changes explicitly, or state "None".
7. Link related issues if known (e.g. `Closes #123`).

## Template

```markdown
## Summary

<1-3 sentences on purpose and outcome>

## Changes made

- <change 1>
- <change 2>

## Testing performed

- [ ] `./scripts/lint.sh`
- [ ] <test command or manual step>

## Screenshots

<!-- Include only for UI changes; otherwise write "N/A" -->

## Breaking changes

<None | description of breaking change and migration steps>

## Related issues

<None | #issue-number>
```

## Guidelines

- Keep the summary scannable; use bullet lists for changes.
- Mention new env vars, migrations, or Docker changes prominently.
- For migration PRs, note whether `alembic upgrade head` is required.
