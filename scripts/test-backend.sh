#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BE_DIR="${ROOT_DIR}/apps/backend"
VENV_DIR="${BE_DIR}/.venv"

DATABASE_URL="${DATABASE_URL:-postgresql+psycopg2://ticket_user:change_me@localhost:5432/ticket_db}"
export DATABASE_URL
export SECRET_KEY="${SECRET_KEY:-local-test-secret-key}"
export SEED_USERS="${SEED_USERS:-false}"

PYTEST_CMD=(python -m pytest)
if [[ -x "${VENV_DIR}/bin/pytest" ]]; then
  PYTEST_CMD=("${VENV_DIR}/bin/python" -m pytest)
elif ! command -v pytest &>/dev/null; then
  echo "pytest not found. Install: pip install -r apps/backend/requirements-dev.txt" >&2
  exit 1
fi

cd "${ROOT_DIR}"
if [[ "${SKIP_MIGRATIONS:-0}" != "1" ]]; then
  if command -v alembic &>/dev/null || [[ -x "${VENV_DIR}/bin/alembic" ]]; then
    ALEMBIC_CMD="alembic"
    [[ -x "${VENV_DIR}/bin/alembic" ]] && ALEMBIC_CMD="${VENV_DIR}/bin/alembic"
    "${ALEMBIC_CMD}" -c alembic.ini upgrade head
  fi
fi

exec "${PYTEST_CMD[@]}" apps/backend/tests "$@"
