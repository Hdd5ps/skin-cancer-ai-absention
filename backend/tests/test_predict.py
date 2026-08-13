"""
PyTest suite for the DermaScan AI FastAPI backend.

Covers:
  - Gate 1: blurry images below BLUR_THRESHOLD → status "blur_error"
  - Gate 2: sharp images with low model confidence → status "low_confidence"
  - Success path: sharp, high-confidence images → status "success" with label
  - Input validation: oversized payloads, invalid content-types
  - Temperature scaling: verify scaled logit differs from raw logit
  - Health endpoint
"""

import io
import struct
from unittest.mock import MagicMock, patch

import cv2
import numpy as np
import pytest
import torch
from fastapi.testclient import TestClient
from PIL import Image

# ---------------------------------------------------------------------------
# App import (patches model loading so no weights file is needed in CI)
# ---------------------------------------------------------------------------
with patch("backend.app._load_model") as mock_load:
    mock_load.return_value = MagicMock(spec=torch.nn.Module)
    from backend.app import (
        BLUR_THRESHOLD,
        CONFIDENCE_THRESHOLD,
        TEMPERATURE,
        _infer,
        _laplacian_variance,
        app,
    )

client = TestClient(app)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_jpeg(sharpness: str = "sharp", size: tuple[int, int] = (224, 224)) -> bytes:
    """
    Return a JPEG image that is either 'sharp' (high-frequency grid) or
    'blurry' (solid grey field that will score ~0 Laplacian variance).
    """
    if sharpness == "sharp":
        arr = np.zeros((*size, 3), dtype=np.uint8)
        arr[::2, ::2] = 255  # checkerboard pattern → high Laplacian variance
    else:
        arr = np.full((*size, 3), 128, dtype=np.uint8)  # flat grey → variance ≈ 0

    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG")
    return buf.getvalue()


def _upload(data: bytes, content_type: str = "image/jpeg") -> dict:
    resp = client.post(
        "/predict",
        files={"file": ("test.jpg", io.BytesIO(data), content_type)},
    )
    return resp


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert "device" in body


# ---------------------------------------------------------------------------
# Gate 1 — blur detection
# ---------------------------------------------------------------------------


class TestGate1Blur:
    def test_blurry_image_triggers_gate1(self):
        """A flat grey image has Laplacian variance ≈ 0 → must return blur_error."""
        data = _make_jpeg("blurry")
        resp = _upload(data)
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "blur_error"
        assert body["gate"] == 1
        assert body["blur_variance"] < BLUR_THRESHOLD
        assert body["label"] is None
        assert body["confidence"] is None

    def test_sharp_image_passes_gate1(self):
        """Checkerboard has very high Laplacian variance → must not return blur_error."""
        data = _make_jpeg("sharp")
        with patch("backend.app._infer", return_value=0.95):
            resp = _upload(data)
        body = resp.json()
        assert body["gate"] != 1, "Sharp image should not trigger Gate 1"

    def test_blur_variance_value_returned(self):
        """Response must always include the computed blur_variance float."""
        data = _make_jpeg("blurry")
        resp = _upload(data)
        assert isinstance(resp.json()["blur_variance"], float)

    def test_laplacian_variance_flat_is_low(self):
        """Unit test: flat grey image Laplacian variance must be below threshold."""
        arr = np.full((224, 224, 3), 128, dtype=np.uint8)
        bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        var = _laplacian_variance(bgr)
        assert var < BLUR_THRESHOLD, f"Expected var < {BLUR_THRESHOLD}, got {var}"

    def test_laplacian_variance_checkerboard_is_high(self):
        """Unit test: checkerboard Laplacian variance must exceed threshold."""
        arr = np.zeros((224, 224, 3), dtype=np.uint8)
        arr[::2, ::2] = 255
        bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        var = _laplacian_variance(bgr)
        assert var > BLUR_THRESHOLD, f"Expected var > {BLUR_THRESHOLD}, got {var}"


# ---------------------------------------------------------------------------
# Gate 2 — confidence / uncertainty abstention
# ---------------------------------------------------------------------------


class TestGate2Confidence:
    def test_low_confidence_triggers_gate2(self):
        """Model returning p≈0.5 → confidence ≈ 0.5, below threshold → low_confidence."""
        data = _make_jpeg("sharp")
        with patch("backend.app._infer", return_value=0.52):
            resp = _upload(data)
        body = resp.json()
        assert body["status"] == "low_confidence"
        assert body["gate"] == 2
        assert body["label"] is None, "Gate 2 must NOT return a label"
        assert body["confidence"] is not None

    def test_gate2_does_not_show_prediction(self):
        """Explicitly verify label is withheld on Gate 2 activation."""
        data = _make_jpeg("sharp")
        with patch("backend.app._infer", return_value=0.55):
            resp = _upload(data)
        assert resp.json()["label"] is None

    def test_confidence_below_threshold_boundary(self):
        """prob=0.5 → confidence=0.5, must be below threshold."""
        data = _make_jpeg("sharp")
        with patch("backend.app._infer", return_value=0.5):
            resp = _upload(data)
        body = resp.json()
        assert body["confidence"] < CONFIDENCE_THRESHOLD

    def test_confidence_at_exactly_threshold_succeeds(self):
        """confidence == CONFIDENCE_THRESHOLD: boundary condition — should succeed."""
        # prob such that max(prob, 1-prob) == CONFIDENCE_THRESHOLD
        prob = CONFIDENCE_THRESHOLD
        data = _make_jpeg("sharp")
        with patch("backend.app._infer", return_value=prob):
            resp = _upload(data)
        # confidence = max(prob, 1-prob) = CONFIDENCE_THRESHOLD → success
        assert resp.json()["status"] == "success"


# ---------------------------------------------------------------------------
# Success path
# ---------------------------------------------------------------------------


class TestSuccessPath:
    def test_high_confidence_benign_returns_label(self):
        """prob < 0.5 → Benign Nevus with D22.9."""
        data = _make_jpeg("sharp")
        with patch("backend.app._infer", return_value=0.05):
            resp = _upload(data)
        body = resp.json()
        assert body["status"] == "success"
        assert body["gate"] == 0
        assert body["label"] == "Benign Nevus"
        assert body["icd10"] == "D22.9"
        assert body["confidence"] >= CONFIDENCE_THRESHOLD

    def test_high_confidence_malignant_returns_label(self):
        """prob >= 0.5 → Melanoma with C43.9."""
        data = _make_jpeg("sharp")
        with patch("backend.app._infer", return_value=0.95):
            resp = _upload(data)
        body = resp.json()
        assert body["status"] == "success"
        assert body["label"] == "Melanoma"
        assert body["icd10"] == "C43.9"

    def test_response_includes_model_metadata(self):
        """Success response must include model_metadata with AUC and ECE."""
        data = _make_jpeg("sharp")
        with patch("backend.app._infer", return_value=0.95):
            resp = _upload(data)
        meta = resp.json()["model_metadata"]
        assert meta["validation_auc"] == pytest.approx(0.8884, rel=1e-3)
        assert meta["calibration_ece"] == pytest.approx(0.0730, rel=1e-2)
        assert meta["temperature"] == pytest.approx(TEMPERATURE, rel=1e-4)


# ---------------------------------------------------------------------------
# Temperature Scaling unit tests
# ---------------------------------------------------------------------------


class TestTemperatureScaling:
    def test_temperature_scaling_reduces_extreme_logit(self):
        """Scaling a high logit by T > 1 must produce a lower probability than raw sigmoid."""
        raw_logit = torch.tensor([[4.0]])
        raw_prob = torch.sigmoid(raw_logit).item()
        scaled_prob = torch.sigmoid(raw_logit / TEMPERATURE).item()
        assert scaled_prob < raw_prob, "Temperature scaling should pull probabilities toward 0.5"

    def test_temperature_value_is_correct(self):
        """T must be exactly 1.1672 per training spec."""
        assert TEMPERATURE == pytest.approx(1.1672, rel=1e-4)

    def test_temperature_scaling_symmetric(self):
        """Scaling must be symmetric: T(logit) and T(-logit) probabilities sum to ~1."""
        logit = 3.0
        p_pos = torch.sigmoid(torch.tensor(logit) / TEMPERATURE).item()
        p_neg = torch.sigmoid(torch.tensor(-logit) / TEMPERATURE).item()
        assert p_pos + p_neg == pytest.approx(1.0, abs=1e-6)


# ---------------------------------------------------------------------------
# Input validation / security boundary
# ---------------------------------------------------------------------------


class TestInputValidation:
    def test_rejects_non_image_content_type(self):
        """PDF uploads must be rejected with 415 Unsupported Media Type."""
        resp = client.post(
            "/predict",
            files={"file": ("malicious.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")},
        )
        assert resp.status_code == 415

    def test_rejects_oversized_image(self):
        """Payloads > 10 MB must be rejected with 413."""
        big = b"X" * (11 * 1024 * 1024)
        resp = client.post(
            "/predict",
            files={"file": ("big.jpg", io.BytesIO(big), "image/jpeg")},
        )
        assert resp.status_code == 413

    def test_rejects_corrupt_image_bytes(self):
        """Random bytes with image content-type must return 422."""
        resp = client.post(
            "/predict",
            files={"file": ("bad.jpg", io.BytesIO(b"\x00\x01\x02"), "image/jpeg")},
        )
        assert resp.status_code == 422

    def test_accepts_png_content_type(self):
        """PNG is an allowed content-type and must not be rejected at validation."""
        arr = np.full((64, 64, 3), 200, dtype=np.uint8)
        buf = io.BytesIO()
        Image.fromarray(arr).save(buf, format="PNG")
        with patch("backend.app._infer", return_value=0.05):
            resp = client.post(
                "/predict",
                files={"file": ("scan.png", io.BytesIO(buf.getvalue()), "image/png")},
            )
        # Blurry flat image → gate 1, but content-type accepted (no 415)
        assert resp.status_code == 200
