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
RUN uv pip install --system dj-database-url==2.3.0 django-environ==0.12.0 psycopg2-binary==2.9.10 django==5.1.6 djangorestframework==3.15.2 django-cors-headers==4.6.0 google-generativeai==0.8.4 pillow==11.1.0 requests==2.32.3

ENTRYPOINT []
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]