"""
DermaScan AI — FastAPI Prediction Backend
Dual-Gated pipeline: Gate 1 (OpenCV blur) → Gate 2 (calibrated MobileNetV2)
"""

import io
import logging
import os
from pathlib import Path
from typing import Any

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

CV2_AVAILABLE = True
CV2_IMPORT_ERROR: str | None = None
try:
    import cv2
except Exception as exc:  # pragma: no cover - runtime platform-dependent
    CV2_AVAILABLE = False
    CV2_IMPORT_ERROR = f"{exc.__class__.__name__}: {exc}"
    cv2 = None  # type: ignore[assignment]

TORCH_AVAILABLE = True
TORCH_IMPORT_ERROR: str | None = None
try:
    import torch
    import torch.nn as nn
    from torchvision import models, transforms
except Exception as exc:  # pragma: no cover - runtime platform-dependent
    TORCH_AVAILABLE = False
    TORCH_IMPORT_ERROR = f"{exc.__class__.__name__}: {exc}"
    torch = None  # type: ignore[assignment]
    nn = None  # type: ignore[assignment]
    models = None  # type: ignore[assignment]
    transforms = None  # type: ignore[assignment]

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_MODEL_PATH = BASE_DIR / "models" / "mobilenetv2_calibrated.pth"
_model_path_env = os.getenv("MODEL_PATH")
MODEL_PATH = Path(_model_path_env) if _model_path_env else DEFAULT_MODEL_PATH
if not MODEL_PATH.is_absolute():
    MODEL_PATH = BASE_DIR / MODEL_PATH

# Gate 1: Laplacian variance threshold. Images below this are flagged blurry.
BLUR_THRESHOLD: float = float(os.getenv("BLUR_THRESHOLD", "100.0"))

# Gate 2: Minimum calibrated probability to show a prediction.
CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.80"))

# Temperature Scaling factor determined post-training via held-out validation.
TEMPERATURE: float = 1.1672

LABEL_MAP = {0: "Benign Nevus", 1: "Melanoma"}
ICD_MAP   = {0: "D22.9",        1: "C43.9"}

# Validation metrics (informational, returned in model_metadata field)
MODEL_AUC: float = 0.8884
MODEL_ECE: float = 0.0730

MAX_IMAGE_BYTES: int = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

# ---------------------------------------------------------------------------
# Model setup
# ---------------------------------------------------------------------------

if TORCH_AVAILABLE:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
else:
    device = "unavailable"

if TORCH_AVAILABLE:
    _transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
else:
    _transform = None


if TORCH_AVAILABLE:
    class ModelWithTemperature(nn.Module):
        """
        MobileNetV2 binary classifier with temperature scaling.

        The training architecture includes a final Sigmoid layer. For calibrated
        logit inference we strip that Sigmoid and apply sigmoid(logits / T) in
        inference code.
        """

        def __init__(self, temperature: float = TEMPERATURE) -> None:
            super().__init__()
            backbone = models.mobilenet_v2(weights=None)
            backbone.classifier = nn.Sequential(
                nn.Dropout(p=0.2),
                nn.Linear(backbone.last_channel, 1),
                nn.Sigmoid(),
            )

            if isinstance(backbone.classifier[-1], nn.Sigmoid):
                backbone.classifier = nn.Sequential(*list(backbone.classifier.children())[:-1])

            self.model = backbone
            self.temperature = nn.Parameter(torch.ones(1) * float(temperature))

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            logits = self.model(x)
            return logits / self.temperature.clamp_min(1e-6)
else:
    ModelWithTemperature = Any


def _extract_state_dict(payload: Any) -> dict[str, Any]:
    if isinstance(payload, dict):
        for key in ("state_dict", "model_state_dict", "model", "net"):
            value = payload.get(key)
            if isinstance(value, dict):
                return value
        if all(isinstance(k, str) for k in payload.keys()):
            return payload
    raise ValueError("Unsupported checkpoint format: no state_dict found")


def _build_model() -> Any:
    """Build calibrated MobileNetV2 with stripped final Sigmoid."""
    if not TORCH_AVAILABLE:
        raise RuntimeError(f"Torch stack unavailable: {TORCH_IMPORT_ERROR}")
    return ModelWithTemperature(temperature=TEMPERATURE)


def _load_model(path: Path) -> Any:
    if not TORCH_AVAILABLE:
        raise RuntimeError(f"Torch stack unavailable: {TORCH_IMPORT_ERROR}")
    if not CV2_AVAILABLE:
        raise RuntimeError(f"OpenCV unavailable: {CV2_IMPORT_ERROR}")
    model = _build_model()
    if path.exists():
        payload = torch.load(path, map_location=device)
        state = _extract_state_dict(payload)

        # Handle DataParallel checkpoints.
        if any(k.startswith("module.") for k in state):
            state = {k.removeprefix("module."): v for k, v in state.items()}

        missing, unexpected = model.load_state_dict(state, strict=False)
        if missing or unexpected:
            logger.warning(
                "Loaded checkpoint with key mismatch. missing=%s unexpected=%s",
                missing,
                unexpected,
            )
        logger.info("Loaded model weights from %s", path)
    else:
        logger.warning("Model file not found at %s — using random weights (dev mode)", path)
    model.to(device)
    model.eval()
    return model


MODEL_READY = False
MODEL_INIT_ERROR: str | None = None
_model: Any = None
if TORCH_AVAILABLE:
    try:
        _model = _load_model(MODEL_PATH)
        MODEL_READY = True
    except Exception as exc:  # pragma: no cover - model file/platform-dependent
        MODEL_INIT_ERROR = f"{exc.__class__.__name__}: {exc}"
        logger.exception("Model initialization failed; API will run in health-only mode")
else:
    MODEL_INIT_ERROR = TORCH_IMPORT_ERROR
    logger.warning("Torch stack unavailable; API running in health-only mode: %s", TORCH_IMPORT_ERROR)

if MODEL_INIT_ERROR is None and not CV2_AVAILABLE:
    MODEL_INIT_ERROR = f"OpenCV unavailable: {CV2_IMPORT_ERROR}"
    logger.warning("OpenCV unavailable; API running in health-only mode: %s", CV2_IMPORT_ERROR)

# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class ModelMetadata(BaseModel):
    architecture: str = "MobileNetV2"
    temperature: float = TEMPERATURE
    validation_auc: float = MODEL_AUC
    calibration_ece: float = MODEL_ECE
    blur_threshold: float = BLUR_THRESHOLD
    confidence_threshold: float = CONFIDENCE_THRESHOLD


class PredictResponse(BaseModel):
    gate: int                        # 1 = blurry, 2 = low confidence, 0 = success
    status: str                      # "blur_error" | "low_confidence" | "success"
    blur_variance: float
    confidence: float | None = None  # calibrated probability (only on success/gate-2)
    label: str | None = None         # only on success
    icd10: str | None = None         # only on success
    model_metadata: ModelMetadata = ModelMetadata()


# ---------------------------------------------------------------------------
# Business logic helpers
# ---------------------------------------------------------------------------


def _validate_upload(file: UploadFile, data: bytes) -> None:
    """Enforce content-type and size constraints on untrusted upload."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{file.content_type}'. Accepted: {sorted(ALLOWED_CONTENT_TYPES)}",
        )
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_IMAGE_BYTES // (1024 * 1024)} MB.",
        )


def _decode_image(data: bytes) -> tuple[np.ndarray, Image.Image]:
    """Decode raw bytes → OpenCV BGR array + PIL RGB image."""
    if not CV2_AVAILABLE:
        raise HTTPException(status_code=503, detail=f"OpenCV unavailable: {CV2_IMPORT_ERROR}")
    try:
        np_arr = np.frombuffer(data, dtype=np.uint8)
        bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if bgr is None:
            raise ValueError("cv2.imdecode returned None")
        pil = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        return bgr, pil
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not decode image: {exc}") from exc


def _laplacian_variance(bgr: np.ndarray) -> float:
    """Gate 1: compute sharpness score via Laplacian variance (higher = sharper)."""
    if not CV2_AVAILABLE:
        raise RuntimeError(f"OpenCV unavailable: {CV2_IMPORT_ERROR}")
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def _infer(pil: Image.Image) -> float:
    """Gate 2: run model inference with temperature scaling; return calibrated P(malignant)."""
    if not MODEL_READY or _transform is None or _model is None:
        raise RuntimeError(f"Model inference unavailable: {MODEL_INIT_ERROR or 'unknown initialization error'}")
    tensor = _transform(pil).unsqueeze(0).to(device)
    with torch.no_grad():
        scaled_logit: torch.Tensor = _model(tensor)  # shape [1, 1], already temperature-scaled
        prob = torch.sigmoid(scaled_logit).item()
    return float(prob)


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="DermaScan AI",
    description="Skin lesion screening API — dual-gated MobileNetV2 pipeline.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str | bool | None]:
    return {
        "status": "ok",
        "device": str(device),
        "model_ready": MODEL_READY,
        "health_mode": not MODEL_READY,
        "model_error": MODEL_INIT_ERROR,
        "torch_available": TORCH_AVAILABLE,
        "opencv_available": CV2_AVAILABLE,
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...)) -> PredictResponse:
    """
    Accept a skin lesion image and return a gated prediction.

    Gate 1 (blur check) runs first. If the image is too blurry the
    endpoint returns early with gate=1. If it passes, Gate 2 (model
    inference) runs. Low-confidence results return gate=2. Only a
    high-confidence prediction returns gate=0 with a label.
    """
    if not MODEL_READY:
        raise HTTPException(
            status_code=503,
            detail=f"Model inference unavailable: {MODEL_INIT_ERROR or 'unknown initialization error'}",
        )

    # --- Input validation (untrusted boundary) ----------------------------
    raw = await file.read()
    _validate_upload(file, raw)

    # --- Decode -----------------------------------------------------------
    bgr, pil = _decode_image(raw)

    # --- Gate 1: blur check -----------------------------------------------
    blur_var = _laplacian_variance(bgr)
    if blur_var < BLUR_THRESHOLD:
        logger.info("Gate 1 triggered: blur_variance=%.2f < threshold=%.2f", blur_var, BLUR_THRESHOLD)
        return PredictResponse(
            gate=1,
            status="blur_error",
            blur_variance=blur_var,
        )

    # --- Gate 2: model inference + confidence threshold -------------------
    prob = _infer(pil)
    logger.info("Gate 2 inference: prob=%.4f, threshold=%.2f", prob, CONFIDENCE_THRESHOLD)

    # confidence = distance from 0.5 mapped to [0, 1]
    confidence = max(prob, 1.0 - prob)

    if confidence < CONFIDENCE_THRESHOLD:
        logger.info("Gate 2 triggered: confidence=%.4f < threshold=%.2f", confidence, CONFIDENCE_THRESHOLD)
        return PredictResponse(
            gate=2,
            status="low_confidence",
            blur_variance=blur_var,
            confidence=round(confidence, 4),
        )

    # --- Success ----------------------------------------------------------
    class_idx = int(prob >= 0.5)
    return PredictResponse(
        gate=0,
        status="success",
        blur_variance=blur_var,
        confidence=round(confidence, 4),
        label=LABEL_MAP[class_idx],
        icd10=ICD_MAP[class_idx],
    )
