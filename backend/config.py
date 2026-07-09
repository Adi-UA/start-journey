"""Application settings, loaded from the environment (prefix ``SJ_``).

Every knob has a default so the app runs with no configuration. Override any
value with an environment variable or a ``.env`` file, for example
``SJ_DEVICE=cuda`` or ``SJ_NUM_INFERENCE_STEPS=30``.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the image-generation service."""

    # ``protected_namespaces=()`` lets us use ``model_id`` without pydantic
    # warning about its reserved ``model_`` prefix.
    model_config = SettingsConfigDict(
        env_prefix="SJ_",
        env_file=".env",
        extra="ignore",
        protected_namespaces=(),
    )

    # Model + inference.
    model_id: str = "CompVis/stable-diffusion-v1-4"
    device: str = "auto"  # auto | cuda | mps | cpu
    num_inference_steps: int = 25
    guidance_scale: float = 8.5
    image_size: int = 512
    hf_token: str | None = None  # only needed for gated models

    # Serving.
    # In production the frontend is served from the same origin, so CORS is a
    # no-op. These origins only matter when you run the Vite dev server
    # separately against this backend.
    allowed_origins: list[str] = ["http://localhost:5173"]
    static_dir: str = "static"  # built frontend copied here in the Docker image

    # When False, the model is not loaded at startup. Tests set this so the app
    # boots without a GPU or model download.
    eager_load: bool = True


@lru_cache
def get_settings() -> Settings:
    """Return a cached ``Settings`` instance."""
    return Settings()
