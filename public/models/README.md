# Offline model

Place the exported Kaggle artifact at `public/models/skin_model.onnx`.

The app expects a MobileNetV2 ONNX model with input `input` shaped
`[1, 3, 224, 224]` and output `prob`, the calibrated malignant probability.
Run `python backend/export_onnx.py` after adding the checkpoint at
`backend/models/mobilenetv2_calibrated.pth` to generate this file.