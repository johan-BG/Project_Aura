# Stage 1: Build/Install
FROM python:3.11-slim as builder

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirement.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirement.txt
RUN pip install --prefix=/install gunicorn certifi

# Stage 2: Final Image
FROM python:3.11-slim

WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .

# Security: Don't run as root
RUN useradd -m myuser
USER myuser

# Use the dynamic $PORT provided by Railway
CMD gunicorn --workers 4 --bind 0.0.0.0:${PORT:-5000} server.app:app