#!/usr/bin/env bash
# Push to GitHub using GITHUB_TOKEN (never commit the token).
#
# Setup (run once per terminal session):
#   export GITHUB_TOKEN="ghp_your_personal_access_token"
#
# Optional:
#   export GITHUB_USER="amulyasharma27797"   # default
#
# Usage:
#   ./scripts/git-push.sh
#   ./scripts/git-push.sh -u origin cursor/phase-0-scaffold

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

# Load from .env if present (gitignored) and GITHUB_TOKEN not already set
if [[ -z "${GITHUB_TOKEN:-}" ]] && [[ -f "${ROOT_DIR}/.env" ]]; then
  # shellcheck source=/dev/null
  set -a
  source "${ROOT_DIR}/.env"
  set +a
fi

GITHUB_USER="${GITHUB_USER:-amulyasharma27797}"

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Error: GITHUB_TOKEN is not set." >&2
  echo "" >&2
  echo "  export GITHUB_TOKEN=\"ghp_your_personal_access_token\"" >&2
  echo "" >&2
  echo "Or add GITHUB_TOKEN to .env (gitignored, never commit)." >&2
  exit 1
fi

REMOTE="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/ticket-management.git"

if [[ $# -eq 0 ]]; then
  BRANCH="$(git branch --show-current)"
  set -- "${BRANCH}:${BRANCH}"
fi

echo "Pushing to github.com/${GITHUB_USER}/ticket-management.git ..."
git push "${REMOTE}" "$@"
git branch --set-upstream-to=origin/"$(git branch --show-current)" 2>/dev/null || true
