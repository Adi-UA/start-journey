---
title: Start Journey
emoji: 🚢
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

![Start Journey](./readme_img.png)

# Start Journey 🚢

[![CI](https://github.com/Adi-UA/start-journey/actions/workflows/ci.yml/badge.svg)](https://github.com/Adi-UA/start-journey/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Type a prompt, get an image. Start Journey is a text-to-image web app that runs
Stable Diffusion behind a FastAPI backend and a React frontend. The backend
serves the built frontend from the same origin, so the whole thing ships as a
single container and deploys to a free Hugging Face Space.

## How it works

```
Browser ──> /            FastAPI serves the built React app (static files)
Browser ──> /api/generate ──> ImageGenerator ──> Stable Diffusion ──> PNG (base64)
```

One app, one origin. In development the Vite dev server proxies `/api` to the
backend; in production FastAPI serves both the UI and the API, so there is no
CORS to configure.

## Device support

The backend auto-detects hardware and picks the fastest available option. Set
`SJ_DEVICE` to force one.

| Device | Precision | Speed (512px, 25 steps) |
|---|---|---|
| CUDA (NVIDIA GPU) | fp16 | seconds |
| Apple MPS | fp32 | tens of seconds |
| CPU | fp32 | 1-3 minutes |

The free Hugging Face Space runs on CPU, so generation there is slow but works.
For fast results, run locally on an NVIDIA GPU or deploy to a GPU Space.

## Quick start (Docker)

```bash
docker build -t start-journey .
docker run -p 7860:7860 start-journey
```

Open http://localhost:7860. The first request downloads the model weights
(~4 GB), which are then cached.

## Local development

Run the backend and frontend as two processes; the Vite dev server proxies API
calls to the backend.

**Backend** (in `backend/`):

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt          # full runtime, incl. Stable Diffusion
# NVIDIA GPU? install a CUDA torch build instead:
# pip install torch --index-url https://download.pytorch.org/whl/cu121
uvicorn app:app --reload                  # http://localhost:8000
```

**Frontend** (in `frontend/`):

```bash
npm install
npm run dev                               # http://localhost:5173
```

## Configuration

All settings are environment variables with the `SJ_` prefix (see
`backend/.env.example`). Every value has a working default.

| Variable | Default | Description |
|---|---|---|
| `SJ_MODEL_ID` | `CompVis/stable-diffusion-v1-4` | Hugging Face model id. |
| `SJ_DEVICE` | `auto` | `auto`, `cuda`, `mps`, or `cpu`. |
| `SJ_NUM_INFERENCE_STEPS` | `25` | Denoising steps. |
| `SJ_GUIDANCE_SCALE` | `8.5` | Classifier-free guidance strength. |
| `SJ_IMAGE_SIZE` | `512` | Output width/height in pixels. |
| `SJ_HF_TOKEN` | unset | Token for gated models. |

The frontend reads `VITE_API_BASE` (default empty = same origin). Override only
when the backend runs elsewhere.

## API

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/api/generate` | `{ "prompt": str, "steps"?: int, "guidance_scale"?: float }` | `{ image, device, steps, guidance_scale }` (image is base64 PNG) |
| `GET` | `/api/health` | — | `{ status, device, model_id, loaded }` |

## Testing

```bash
# Backend (GPU-free: the pipeline is mocked)
cd backend && pip install -r requirements-dev.txt && ruff check . && pytest

# Frontend
cd frontend && npm ci && npm run build && npm test
```

## Deploy to Hugging Face Spaces

1. Create a new **Docker** Space.
2. Push this repository to the Space's git remote.

The `README.md` front-matter (`sdk: docker`, `app_port: 7860`) and the
`Dockerfile` are all the Space needs. It builds the image, serves the UI, and
runs the model on CPU.

## Tech stack

Backend: FastAPI, Diffusers, PyTorch, Pydantic. Frontend: React, TypeScript,
Vite, Chakra UI, TanStack Query. Packaging: Docker (multi-stage). CI: GitHub
Actions.

## License

[MIT](./LICENSE)
