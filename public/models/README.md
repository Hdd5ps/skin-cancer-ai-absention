# Offline model

Place the exported ONNX artifact at `public/models/skin_model.onnx`.

The app expects a MobileNetV2 ONNX model with input `input` shaped
`[1, 3, 224, 224]` and output `prob`, the calibrated malignant probability.

To generate it:

1. Obtain the calibrated project checkpoint from the model-training/Kaggle
   workflow and save it as
   `backend/models/mobilenetv2_calibrated.pth`.
2. Run `python backend/export_onnx.py` from the repository root.
3. Confirm that the exporter prints matching PyTorch and ONNX probabilities.

The checkpoint must contain the calibrated project MobileNetV2 weights. A
similarly named or bundled dependency checkpoint, such as
`node_modules/detect-node/mobilenet_v2-b0353104.pth`, is not a substitute and
may fail the exporter's strict state-dict validation.