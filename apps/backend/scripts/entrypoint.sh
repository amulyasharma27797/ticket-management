#!/usr/bin/env bash
set -euo pipefail

echo "Waiting for PostgreSQL..."
python - <<'PY'
import os
import sys
import time

import psycopg2

url = os.environ.get("DATABASE_URL", "")
# postgresql+psycopg2://user:pass@host:port/db -> parse for psycopg2
if url.startswith("postgresql+psycopg2://"):
    url = url.replace("postgresql+psycopg2://", "postgresql://", 1)

for attempt in range(30):
    try:
        conn = psycopg2.connect(url)
        conn.close()
        print("PostgreSQL is ready.")
        sys.exit(0)
    except Exception:
        time.sleep(1)

print("PostgreSQL did not become ready in time.", file=sys.stderr)
sys.exit(1)
PY

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
