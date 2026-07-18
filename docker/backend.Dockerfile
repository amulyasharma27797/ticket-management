FROM python:3.12-slim AS base

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

FROM base AS development

ENTRYPOINT ["bash", "scripts/entrypoint.sh"]

FROM base AS production

RUN groupadd --system app \
    && useradd --system --gid app --home-dir /app --shell /usr/sbin/nologin app \
    && chown -R app:app /app

USER app

ENTRYPOINT ["bash", "scripts/entrypoint.sh"]

FROM base AS test

COPY apps/backend/requirements-dev.txt /tmp/requirements-dev.txt
RUN pip install --no-cache-dir -r /tmp/requirements-dev.txt

WORKDIR /app

ENTRYPOINT []
CMD ["python", "-m", "pytest", "apps/backend/tests", "-v"]
