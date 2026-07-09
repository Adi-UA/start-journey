"""Stable Diffusion pipeline wrapper.

Heavy imports (``torch``, ``diffusers``) happen inside methods, not at module
load, so the rest of the app (and its tests) can import this module without a
GPU or the ML stack installed.
"""

from __future__ import annotations

import base64
import io
import logging

from config import Settings

logger = logging.getLogger(__name__)


def resolve_device(preference: str) -> str:
    """Turn a device preference into a concrete device string.

    ``"auto"`` picks CUDA, then Apple MPS, then CPU. Any explicit value is
    returned unchanged.
    """
    if preference != "auto":
        return preference

    import torch

    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


class ImageGenerator:
    """Loads a Stable Diffusion pipeline and renders prompts to PNG bytes."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self.device = resolve_device(settings.device)
        self._pipe = None  # loaded lazily in ``load()``

    @property
    def loaded(self) -> bool:
        """True once the pipeline weights are in memory."""
        return self._pipe is not None

    def load(self) -> None:
        """Load the pipeline onto the resolved device. Idempotent."""
        if self._pipe is not None:
            return

        import torch
        from diffusers import StableDiffusionPipeline

        # fp16 halves memory and speeds up CUDA. MPS/CPU are more stable in
        # fp32, so only CUDA gets the half-precision variant.
        use_fp16 = self.device == "cuda"
        logger.info("Loading %s on %s", self._settings.model_id, self.device)
        pipe = StableDiffusionPipeline.from_pretrained(
            self._settings.model_id,
            torch_dtype=torch.float16 if use_fp16 else torch.float32,
            variant="fp16" if use_fp16 else None,
            token=self._settings.hf_token,
            safety_checker=None,
        )
        self._pipe = pipe.to(self.device)

    def generate(
        self,
        prompt: str,
        steps: int | None = None,
        guidance_scale: float | None = None,
    ) -> tuple[str, int, float]:
        """Render ``prompt`` and return ``(base64_png, steps, guidance_scale)``.

        Raises ``RuntimeError`` if the pipeline has not been loaded.
        """
        if self._pipe is None:
            raise RuntimeError("Pipeline is not loaded; call load() first.")

        steps = steps or self._settings.num_inference_steps
        guidance_scale = guidance_scale or self._settings.guidance_scale
        size = self._settings.image_size

        image = self._pipe(
            prompt,
            num_inference_steps=steps,
            guidance_scale=guidance_scale,
            height=size,
            width=size,
        ).images[0]

        return self._encode_png(image), steps, guidance_scale

    @staticmethod
    def _encode_png(image) -> str:
        """Encode a PIL image as a base64 PNG string."""
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("ascii")
