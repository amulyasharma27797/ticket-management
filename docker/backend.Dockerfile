FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY apps/backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY alembic.ini /app/alembic.ini
COPY migrations/ /app/migrations/
COPY apps/backend/ /app/apps/backend/

WORKDIR /app/apps/backend

ENV PYTHONPATH=/app/apps/backend
ENV PYTHONUNBUFFERED=1

RUN chmod +x scripts/entrypoint.sh

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

ENTRYPOINT ["bash", "scripts/entrypoint.sh"]
