#!/usr/bin/env bash
# Install git hooks from .githooks/ into .git/hooks/
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_SRC="${ROOT_DIR}/.githooks"
HOOKS_DST="${ROOT_DIR}/.git/hooks"

if [[ ! -d "${HOOKS_DST}" ]]; then
  echo "Error: .git/hooks not found. Is this a git repository?"
  exit 1
fi

for hook in pre-commit pre-push; do
  if [[ -f "${HOOKS_SRC}/${hook}" ]]; then
    cp "${HOOKS_SRC}/${hook}" "${HOOKS_DST}/${hook}"
    chmod +x "${HOOKS_DST}/${hook}"
    echo "Installed: ${hook}"
  fi
done

echo "Git hooks installed. Lint runs automatically on commit (staged) and push (full)."
