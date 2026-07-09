"""FastAPI application.

Exposes the image API under ``/api`` and, when a built frontend is present,
serves it from the same origin at ``/`` (so no CORS is needed in production).
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import Settings, get_settings
from generator import ImageGenerator
from schemas import GenerateRequest, GenerateResponse, HealthResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create the generator on startup and, if eager, load the weights."""
    settings = get_settings()
    generator = ImageGenerator(settings)
    if settings.eager_load:
        generator.load()
    app.state.generator = generator
    yield
    app.state.generator = None


app = FastAPI(title="Start Journey", version="1.0.0", lifespan=lifespan)

_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_generator(request: Request) -> ImageGenerator:
    """Return the loaded generator or fail with 503 if it is not ready."""
    generator = getattr(request.app.state, "generator", None)
    if generator is None or not generator.loaded:
        raise HTTPException(status_code=503, detail="Model is not ready yet.")
    return generator


@app.get("/api/health", response_model=HealthResponse)
def health(
    request: Request, settings: Annotated[Settings, Depends(get_settings)]
) -> HealthResponse:
    """Report device, model, and whether the pipeline is loaded."""
    generator = getattr(request.app.state, "generator", None)
    loaded = bool(generator and generator.loaded)
    device = generator.device if generator else settings.device
    return HealthResponse(
        status="ok",
        device=device,
        model_id=settings.model_id,
        loaded=loaded,
    )


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(
    body: GenerateRequest,
    generator: Annotated[ImageGenerator, Depends(get_generator)],
) -> GenerateResponse:
    """Generate an image from a text prompt."""
    try:
        # Inference is CPU/GPU-bound and blocking, so run it off the event loop.
        image, steps, guidance = await run_in_threadpool(
            generator.generate, body.prompt, body.steps, body.guidance_scale
        )
    except Exception as exc:  # surface a clean error instead of a raw 500
        logger.exception("Generation failed")
        raise HTTPException(status_code=500, detail="Image generation failed.") from exc

    return GenerateResponse(
        image=image, device=generator.device, steps=steps, guidance_scale=guidance
    )


# Serve the built frontend from the same origin when it exists (production
# image). In local dev without a build, the API still runs on its own.
if os.path.isdir(_settings.static_dir):
    app.mount(
        "/",
        StaticFiles(directory=_settings.static_dir, html=True),
        name="static",
    )
