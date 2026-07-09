"""Stable Diffusion pipeline wrapper.

Heavy imports (``torch``, ``diffusers``) happen inside methods, not at module
load, so the rest of the app (and its tests) can import this module without a
GPU or the ML stack installed.
"""

from __future__ import annotations

import base64
import io
import logging
from collections.abc import Callable

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
        from diffusers import AutoPipelineForText2Image

        # fp16 halves memory and speeds up CUDA. MPS/CPU are more stable in
        # fp32, so only CUDA gets the half-precision variant.
        use_fp16 = self.device == "cuda"
        dtype = torch.float16 if use_fp16 else torch.float32
        logger.info("Loading %s on %s", self._settings.model_id, self.device)

        # AutoPipeline picks the right pipeline for the model id (SD 1.x/2.x,
        # SDXL, Turbo, LCM, ...), so the model is swappable via SJ_MODEL_ID.
        try:
            pipe = AutoPipelineForText2Image.from_pretrained(
                self._settings.model_id,
                torch_dtype=dtype,
                variant="fp16" if use_fp16 else None,
                token=self._settings.hf_token,
            )
        except Exception:
            # Not every model ships an fp16 weight variant; retry without it.
            pipe = AutoPipelineForText2Image.from_pretrained(
                self._settings.model_id,
                torch_dtype=dtype,
                token=self._settings.hf_token,
            )

        # Disable the SD 1.x/2.x NSFW filter if present; it produces black
        # images on false positives, which is bad for a demo. No-op for models
        # (e.g. SDXL) that have no safety checker.
        if getattr(pipe, "safety_checker", None) is not None:
            pipe.safety_checker = None
            pipe.requires_safety_checker = False

        self._pipe = pipe.to(self.device)

    def generate(
        self,
        prompt: str,
        steps: int | None = None,
        guidance_scale: float | None = None,
        progress_callback: Callable[[int, int], None] | None = None,
    ) -> tuple[str, int, float]:
        """Render ``prompt`` and return ``(base64_png, steps, guidance_scale)``.

        If ``progress_callback`` is given, it is called after each denoising
        step with ``(completed_steps, total_steps)``.

        Raises ``RuntimeError`` if the pipeline has not been loaded.
        """
        if self._pipe is None:
            raise RuntimeError("Pipeline is not loaded; call load() first.")

        steps = steps or self._settings.num_inference_steps
        guidance_scale = guidance_scale or self._settings.guidance_scale
        size = self._settings.image_size

        def _on_step_end(_pipe, step: int, _timestep, callback_kwargs: dict) -> dict:
            # ``step`` is 0-indexed and fires after the step completes.
            progress_callback(step + 1, steps)
            return callback_kwargs

        image = self._pipe(
            prompt,
            num_inference_steps=steps,
            guidance_scale=guidance_scale,
            height=size,
            width=size,
            callback_on_step_end=_on_step_end if progress_callback else None,
        ).images[0]

        return self._encode_png(image), steps, guidance_scale

    @staticmethod
    def _encode_png(image) -> str:
        """Encode a PIL image as a base64 PNG string."""
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("ascii")
