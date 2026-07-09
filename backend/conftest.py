"""Shared test setup.

Sets a torch-free environment before the app is imported: an explicit ``cpu``
device (so ``resolve_device`` never imports torch), no eager model load, and a
non-existent static dir (so the frontend mount is skipped).
"""

from __future__ import annotations

import base64
import os

os.environ["SJ_DEVICE"] = "cpu"
os.environ["SJ_EAGER_LOAD"] = "false"
os.environ["SJ_STATIC_DIR"] = "__no_static__"

import pytest
from fastapi.testclient import TestClient

from app import app, get_generator


class FakeGenerator:
    """Stand-in for ImageGenerator that returns a tiny fixed payload."""

    device = "cpu"
    loaded = True

    def generate(self, prompt, steps=None, guidance_scale=None):
        image = base64.b64encode(b"fake-png-bytes").decode("ascii")
        return image, steps or 25, guidance_scale or 8.5


@pytest.fixture
def client():
    """TestClient with the generator dependency replaced by a fake."""
    app.dependency_overrides[get_generator] = lambda: FakeGenerator()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
