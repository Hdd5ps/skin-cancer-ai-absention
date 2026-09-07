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
The ONNX output is the calibrated `P(malignant)`. The app should apply
`label = prob >= 0.5 ? "Melanoma" : "Benign Nevus"` and the confidence gate
`max(prob, 1 - prob) >= 0.80`.

The blur gate (`Laplacian variance < 100`) remains a separate JavaScript port
for a later phase.