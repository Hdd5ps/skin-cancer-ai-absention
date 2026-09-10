"""Export the calibrated MobileNetV2 checkpoint for offline inference."""

from pathlib import Path
from typing import Any

import onnxruntime as ort
import torch
from torch import nn
from torchvision import models


BASE_DIR = Path(__file__).resolve().parent
# This is the calibrated project checkpoint, not a generic torchvision weight
# file. The matching ONNX artifact is generated under public/models/.
CHECKPOINT_PATH = BASE_DIR / "models" / "mobilenetv2_calibrated.pth"
OUTPUT_PATH = BASE_DIR.parent / "public" / "models" / "skin_model.onnx"
TEMPERATURE = 0.7540


class ModelWithTemperature(nn.Module):
    """MobileNetV2 architecture used by the backend checkpoint."""

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


class CalibratedProbability(nn.Module):
    """Return the final calibrated malignant probability on graph."""

    def __init__(self, model: ModelWithTemperature) -> None:
        super().__init__()
        self.model = model

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.sigmoid(self.model(x))


def _extract_state_dict(payload: Any) -> dict[str, Any]:
    if isinstance(payload, dict):
        for key in ("state_dict", "model_state_dict", "model", "net"):
            value = payload.get(key)
            if isinstance(value, dict):
                return value
        if all(isinstance(key, str) for key in payload):
            return payload
    raise ValueError("Unsupported checkpoint format: no state_dict found")


def _load_model() -> ModelWithTemperature:
    """Load the calibrated project checkpoint with an exact architecture match."""
    if not CHECKPOINT_PATH.exists():
        raise FileNotFoundError(f"Checkpoint not found: {CHECKPOINT_PATH}")

    payload = torch.load(CHECKPOINT_PATH, map_location="cpu")
    state = _extract_state_dict(payload)
    if any(key.startswith("module.") for key in state):
        state = {key.removeprefix("module."): value for key, value in state.items()}

    model = ModelWithTemperature()
    missing, unexpected = model.load_state_dict(state, strict=True)
    if missing or unexpected:
        raise RuntimeError(f"Checkpoint key mismatch: missing={missing}, unexpected={unexpected}")
    model.eval()
    print(f"Loaded temperature: {model.temperature.item():.10f}")
    return model


def main() -> None:
    """Export and numerically validate the offline inference model."""
    model = _load_model()
    export_model = CalibratedProbability(model).eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with torch.no_grad():
        torch_probability = export_model(dummy_input).cpu().numpy()

    torch.onnx.export(
        export_model,
        dummy_input,
        OUTPUT_PATH,
        input_names=["input"],
        output_names=["prob"],
        opset_version=17,
        dynamo=False,
    )

    session = ort.InferenceSession(str(OUTPUT_PATH), providers=["CPUExecutionProvider"])
    onnx_probability = session.run(["prob"], {"input": dummy_input.numpy()})[0]
    print(f"PyTorch probability: {torch_probability.tolist()}")
    print(f"ONNX probability: {onnx_probability.tolist()}")
    if not torch.allclose(
        torch.from_numpy(torch_probability),
        torch.from_numpy(onnx_probability),
        atol=1e-4,
        rtol=0.0,
    ):
        raise AssertionError("PyTorch and ONNX probabilities diverged beyond atol=1e-4")
    print(f"Exported {OUTPUT_PATH}")


if __name__ == "__main__":
    main()