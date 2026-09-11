# Offline Model Export

Install the export dependencies and run the exporter from the repository root:

```bash
pip install -r backend/requirements-export.txt
python backend/export_onnx.py
```

The script reads `backend/models/mobilenetv2_calibrated.pth` and writes
`public/models/skin_model.onnx`. It verifies the exported model against PyTorch
on the same random input before succeeding.

Preprocess every image as `224x224` RGB input with ImageNet normalization:
mean `[0.485, 0.456, 0.406]` and standard deviation `[0.229, 0.224, 0.225]`.
The ONNX output is the calibrated `P(Melanoma)`, where Melanoma is the positive
class and `prob` is the malignant probability. The app uses `0.15` as the
operating point:

```text
label = prob >= 0.15 ? "Melanoma" : "Benign Nevus"
confidence = max(prob, 1 - prob)
```

The combined abstention gate is applied only when both conditions are true:
`confidence < 0.80` and `prob < 0.15`. Successful results are displayed in
risk bands: Elevated concern at `prob >= 0.40`, Borderline: monitor closely at
`0.15 <= prob < 0.40`, and Lower concern below `0.15`.

The blur gate (`Laplacian variance < 100`) remains a separate JavaScript port
for a later phase.
