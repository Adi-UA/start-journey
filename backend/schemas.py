"""Pydantic request and response models for the API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """Body for ``POST /api/generate``."""

    prompt: str = Field(min_length=1, max_length=500, description="Text prompt.")
    steps: int | None = Field(
        default=None,
        ge=1,
        le=100,
        description="Denoising steps. Falls back to the server default.",
    )
    guidance_scale: float | None = Field(
        default=None,
        ge=1.0,
        le=20.0,
        description="Classifier-free guidance strength. Server default if unset.",
    )


class GenerateResponse(BaseModel):
    """Successful response from ``POST /api/generate``."""

    image: str = Field(description="Base64-encoded PNG (no data-URI prefix).")
    device: str = Field(description="Device the model ran on.")
    steps: int = Field(description="Denoising steps actually used.")
    guidance_scale: float = Field(description="Guidance scale actually used.")


class HealthResponse(BaseModel):
    """Response from ``GET /api/health``."""

    status: str
    device: str
    model_id: str
    loaded: bool
