# backend/Dockerfile
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY . .

# Install using uv pip
RUN uv pip install --system -e .

ENTRYPOINT []
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]