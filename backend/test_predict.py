#!/usr/bin/env python3
"""Quick live API probe for /predict.

Usage:
  python backend/test_predict.py
  python backend/test_predict.py --url http://127.0.0.1:8000/predict
  python backend/test_predict.py --image /path/to/image.jpg
"""

from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

import httpx
import numpy as np
from PIL import Image


def make_dummy_jpeg(size: tuple[int, int] = (224, 224)) -> bytes:
    """Generate a sharp checkerboard image so Gate 1 blur rejection is less likely."""
    arr = np.zeros((size[1], size[0], 3), dtype=np.uint8)
    arr[::2, ::2] = 255
    arr[1::2, 1::2] = 255
    buf = io.BytesIO()
    Image.fromarray(arr).save(buf, format="JPEG", quality=95)
    return buf.getvalue()


def read_or_generate_image(image_path: str | None) -> tuple[str, bytes]:
    if image_path:
        path = Path(image_path)
        if not path.exists():
            raise FileNotFoundError(f"Image not found: {path}")
        return path.name, path.read_bytes()
    return "dummy.jpg", make_dummy_jpeg()


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke test the FastAPI /predict endpoint")
    parser.add_argument("--url", default="http://127.0.0.1:8000/predict", help="Predict endpoint URL")
    parser.add_argument("--image", default=None, help="Optional local image file path")
    parser.add_argument("--timeout", type=float, default=30.0, help="HTTP timeout in seconds")
    args = parser.parse_args()

    filename, image_bytes = read_or_generate_image(args.image)

    files = {
        "file": (filename, image_bytes, "image/jpeg"),
    }

    try:
        with httpx.Client(timeout=args.timeout) as client:
            resp = client.post(args.url, files=files)
    except Exception as exc:
        print(f"ERROR: Request failed: {exc}")
        print("Hint: Start uvicorn in a separate terminal before running this script.")
        print("Example: uvicorn backend.app:app --host 0.0.0.0 --port 8000")
        return 2

    print(f"HTTP {resp.status_code}")
    try:
        body = resp.json()
    except Exception:
        body = {"raw": resp.text}
    print(body)

    if resp.status_code == 503:
        print("FAIL: Service is in fallback mode (503).")
        return 3

    if resp.status_code != 200:
        print("FAIL: Expected HTTP 200 from /predict.")
        return 4

    if "status" not in body or "gate" not in body:
        print("FAIL: Response schema missing expected keys (status/gate).")
        return 5

    print("PASS: Model endpoint returned 200 with gate/prediction payload.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
