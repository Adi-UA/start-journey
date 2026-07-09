# syntax=docker/dockerfile:1

# --- Stage 1: build the Vite frontend into static files ---
FROM node:22-slim AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python backend that also serves the built frontend ---
FROM python:3.11-slim AS runtime
WORKDIR /app

# Runtime libraries needed by Pillow / torch image ops.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first for better layer caching. On Linux this pulls the
# CPU build of torch, which is what the free Hugging Face Space runs on.
COPY backend/requirements.txt backend/requirements-web.txt backend/requirements-ml.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Backend source, then the built frontend into the static dir the app serves.
COPY backend/ ./
COPY --from=frontend /frontend/dist ./static

# Device stays on auto so the same image uses a GPU when one is present and
# falls back to CPU otherwise.
ENV SJ_STATIC_DIR=static \
    SJ_DEVICE=auto \
    HF_HOME=/app/.cache/huggingface
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
