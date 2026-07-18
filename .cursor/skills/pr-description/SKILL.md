---
name: pr-description
description: Generate a pull request description with What, Why, Alternatives, Test cases, and Acceptance criteria. Use when opening or updating a PR.
---

# PR Description

Generate a PR description that follows the project template in `.cursor/rules/pull-request-template.mdc`.

## Required sections (all five)

1. **What** — concrete changes (APIs, UI, files, config)
2. **Why** — problem, goal, or phase requirement
3. **Alternatives considered** — options evaluated and why rejected
4. **Test cases** — commands run + manual scenarios (checkboxes)
5. **Acceptance criteria** — measurable merge conditions (checkboxes)

## Workflow

1. Sync with `main` per `git-sync-with-main` rule.
2. Run `./scripts/lint.sh` before drafting.
3. Inspect `git log` and `git diff main...HEAD`.
4. Fill every section; do not leave placeholders.
5. Open PR via `gh pr create` with HEREDOC body.

## Template

```markdown
## What
- <bullet list of changes>

## Why
<1–3 sentences on motivation>

## Alternatives considered
- **<Option A>:** <brief> — rejected because <reason>
- **Chosen:** <what this PR does> — <why best fit>

## Test cases
- [ ] `./scripts/lint.sh`
- [ ] <backend/frontend test commands>
- [ ] Manual: <scenario>

## Acceptance criteria
- [ ] <checkable condition>
- [ ] <checkable condition>
```

## Guidelines

- Mention migrations, env vars, and Docker changes under **What**.
- For UI PRs, note manual flows under **Test cases** (no screenshot required unless user asks).
- **Alternatives considered** must be honest; skip only when change is trivial and document that explicitly.
