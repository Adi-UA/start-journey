"""Tests for the FastAPI endpoints (pipeline mocked, GPU-free)."""

from __future__ import annotations


def test_health_reports_unloaded(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["device"] == "cpu"
    assert body["loaded"] is False
    assert body["model_id"] == "stabilityai/stable-diffusion-2-1"


def test_generate_returns_image(client):
    response = client.post("/api/generate", json={"prompt": "a cat astronaut"})
    assert response.status_code == 200
    body = response.json()
    assert body["image"]  # non-empty base64
    assert body["device"] == "cpu"
    assert body["steps"] == 25
    assert body["guidance_scale"] == 8.5


def test_generate_honours_custom_params(client):
    response = client.post(
        "/api/generate",
        json={"prompt": "x", "steps": 10, "guidance_scale": 5.0},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["steps"] == 10
    assert body["guidance_scale"] == 5.0


def test_generate_rejects_empty_prompt(client):
    response = client.post("/api/generate", json={"prompt": ""})
    assert response.status_code == 422


def test_generate_rejects_out_of_range_steps(client):
    response = client.post("/api/generate", json={"prompt": "x", "steps": 999})
    assert response.status_code == 422


def test_generate_stream_emits_progress_then_result(client):
    import json

    with client.stream(
        "POST", "/api/generate/stream", json={"prompt": "a cat", "steps": 3}
    ) as response:
        assert response.status_code == 200
        events = [json.loads(line) for line in response.iter_lines() if line]

    progress = [e for e in events if e["type"] == "progress"]
    results = [e for e in events if e["type"] == "result"]

    assert len(progress) == 3
    assert progress[-1]["step"] == 3
    assert progress[-1]["total"] == 3
    assert len(results) == 1
    assert results[0]["image"]
    assert results[0]["device"] == "cpu"
