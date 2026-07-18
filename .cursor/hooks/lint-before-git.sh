#!/usr/bin/env bash
# Cursor hook: run lint before git commit or push commands.
set -euo pipefail

input=$(cat)
command=$(echo "${input}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('command',''))" 2>/dev/null || echo "")

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LINT_SCRIPT="${ROOT_DIR}/scripts/lint.sh"

if [[ ! -x "${LINT_SCRIPT}" ]]; then
  chmod +x "${LINT_SCRIPT}" 2>/dev/null || true
fi

if [[ "${command}" =~ git[[:space:]]+commit ]]; then
  if [[ -x "${LINT_SCRIPT}" ]]; then
    if ! "${LINT_SCRIPT}" --staged 2>&1; then
      echo '{
        "permission": "ask",
        "user_message": "Lint checks failed on staged files. Fix errors before committing, or run: ./scripts/lint.sh --staged --fix",
        "agent_message": "Lint failed before git commit. Run ./scripts/lint.sh --staged, fix issues, then retry commit. Use ruff-lint and eslint-check skills."
      }'
      exit 0
    fi
  fi
elif [[ "${command}" =~ git[[:space:]]+push ]]; then
  if [[ -x "${LINT_SCRIPT}" ]]; then
    if ! "${LINT_SCRIPT}" 2>&1; then
      echo '{
        "permission": "ask",
        "user_message": "Full lint check failed. Fix errors before pushing, or run: ./scripts/lint.sh --fix",
        "agent_message": "Lint failed before git push. Run ./scripts/lint.sh, fix all issues, then retry push."
      }'
      exit 0
    fi
  fi
fi

echo '{ "permission": "allow" }'
exit 0
