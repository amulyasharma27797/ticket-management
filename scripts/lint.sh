#!/usr/bin/env bash
# Run Ruff (Python) and ESLint (JS/TS) for the monorepo.
#
# Usage:
#   ./scripts/lint.sh              # lint all files
#   ./scripts/lint.sh --staged     # lint only staged files (pre-commit)
#   ./scripts/lint.sh --fix        # auto-fix where possible
#   ./scripts/lint.sh --python     # ruff only
#   ./scripts/lint.sh --js         # eslint only

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BE_DIR="${ROOT_DIR}/apps/backend"
FE_DIR="${ROOT_DIR}/apps/frontend"
VENV_DIR="${BE_DIR}/.venv"

MODE="all"
FIX=false
STAGED=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --staged) STAGED=true; shift ;;
    --fix)    FIX=true; shift ;;
    --python) MODE="python"; shift ;;
    --js)     MODE="js"; shift ;;
    *) shift ;;
  esac
done

log()  { printf '\033[1;34m[lint]\033[0m %s\n' "$*"; }
err()  { printf '\033[1;31m[lint]\033[0m %s\n' "$*" >&2; }

FAILED=0

# Collect staged files by extension
get_staged_files() {
  local pattern="$1"
  git -C "${ROOT_DIR}" diff --cached --name-only --diff-filter=ACMR 2>/dev/null | grep -E "${pattern}" || true
}

# ---------------------------------------------------------------------------
# Ruff (Python)
# ---------------------------------------------------------------------------
run_ruff() {
  local files=()
  if [[ "${STAGED}" == true ]]; then
    mapfile -t files < <(get_staged_files '\.py$')
    if [[ ${#files[@]} -eq 0 ]]; then
      log "No staged Python files — skipping ruff."
      return 0
    fi
  fi

  local ruff_cmd="ruff"
  if [[ -x "${VENV_DIR}/bin/ruff" ]]; then
    ruff_cmd="${VENV_DIR}/bin/ruff"
  elif ! command -v ruff &>/dev/null; then
    err "ruff not found. Install: pip install ruff (or activate apps/backend/.venv)"
    return 1
  fi

  log "Running ruff..."
  local ruff_args=(check)
  [[ "${FIX}" == true ]] && ruff_args+=(--fix)
  ruff_args+=(--config "${ROOT_DIR}/pyproject.toml")

  if [[ ${#files[@]} -gt 0 ]]; then
    "${ruff_cmd}" "${ruff_args[@]}" "${files[@]}" || FAILED=1
  else
    "${ruff_cmd}" "${ruff_args[@]}" "${BE_DIR}" || FAILED=1
  fi

  if [[ "${FIX}" == false ]]; then
    local format_args=(format --check)
    if [[ ${#files[@]} -gt 0 ]]; then
      "${ruff_cmd}" "${format_args[@]}" --config "${ROOT_DIR}/pyproject.toml" "${files[@]}" || FAILED=1
    else
      "${ruff_cmd}" "${format_args[@]}" --config "${ROOT_DIR}/pyproject.toml" "${BE_DIR}" || FAILED=1
    fi
  elif [[ "${FIX}" == true ]]; then
    if [[ ${#files[@]} -gt 0 ]]; then
      "${ruff_cmd}" format --config "${ROOT_DIR}/pyproject.toml" "${files[@]}" || FAILED=1
    else
      "${ruff_cmd}" format --config "${ROOT_DIR}/pyproject.toml" "${BE_DIR}" || FAILED=1
    fi
  fi
}

# ---------------------------------------------------------------------------
# ESLint (JS/TS)
# ---------------------------------------------------------------------------
run_eslint() {
  if [[ ! -f "${FE_DIR}/package.json" ]]; then
    log "Frontend not scaffolded — skipping eslint."
    return 0
  fi

  local files=()
  if [[ "${STAGED}" == true ]]; then
    mapfile -t files < <(get_staged_files '\.(ts|tsx|js|jsx)$')
    if [[ ${#files[@]} -eq 0 ]]; then
      log "No staged JS/TS files — skipping eslint."
      return 0
    fi
  fi

  if [[ ! -d "${FE_DIR}/node_modules" ]]; then
    err "node_modules not found. Run: cd apps/frontend && npm install"
    return 1
  fi

  log "Running eslint..."
  local eslint_args=()
  [[ "${FIX}" == true ]] && eslint_args+=(--fix)

  if [[ ${#files[@]} -gt 0 ]]; then
  # Paths relative to frontend dir
    local rel_files=()
    for f in "${files[@]}"; do
      rel_files+=("${f#apps/frontend/}")
    done
    (cd "${FE_DIR}" && npx eslint "${eslint_args[@]}" --max-warnings 0 "${rel_files[@]}") || FAILED=1
  else
    (cd "${FE_DIR}" && npm run lint) || FAILED=1
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
case "${MODE}" in
  python) run_ruff ;;
  js)     run_eslint ;;
  all)
    run_ruff
    run_eslint
    ;;
esac

if (( FAILED > 0 )); then
  err "Lint checks failed."
  exit 1
fi

log "All lint checks passed."
