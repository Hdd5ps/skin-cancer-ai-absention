import * as ort from 'onnxruntime-web'
import type { PredictResponse } from '../App'

const MODEL_URL = '/models/skin_model.onnx'
const IMAGE_SIZE = 224
const LOCAL_BLUR_THRESHOLD = 100
const LOCAL_CONFIDENCE_THRESHOLD = 0.8
const LOCAL_TEMPERATURE = 0.7928
const LOCAL_MALIGNANT_THRESHOLD = 0.15

type WorkerRequest = { id: number; type: 'warm' } | { id: number; type: 'analyze'; dataUrl: string }
type WorkerResponse = { id: number; result?: PredictResponse; error?: string }
type WorkerScope = {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null
  postMessage: (message: WorkerResponse) => void
}

const workerScope = self as unknown as WorkerScope
let sessionPromise: Promise<ort.InferenceSession> | null = null

function inferenceInput(data: Float32Array) {
  return { input: new ort.Tensor('float32', data, [1, 3, IMAGE_SIZE, IMAGE_SIZE]) }
}

async function createWarmedSession(providers: string[]) {
  const session = await ort.InferenceSession.create(MODEL_URL, { executionProviders: providers })
  try {
    await session.run(inferenceInput(new Float32Array(3 * IMAGE_SIZE * IMAGE_SIZE)))
    return session
  } catch (error) {
    await session.release()
    throw error
  }
}

function getSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      if ('gpu' in navigator) {
        try {
          return await createWarmedSession(['webgpu', 'wasm'])
        } catch {
          // Unsupported or unavailable WebGPU falls back to the portable WASM provider.
        }
      }
      return createWarmedSession(['wasm'])
    })().catch((error) => {
      sessionPromise = null
      throw error
    })
  }
  return sessionPromise
}

function blurVariance(pixels: Uint8ClampedArray, width: number, height: number) {
  const grayscale = new Float32Array(width * height)
  for (let index = 0; index < grayscale.length; index += 1) {
    const pixel = index * 4
    grayscale[index] = 0.299 * pixels[pixel] + 0.587 * pixels[pixel + 1] + 0.114 * pixels[pixel + 2]
  }

  let total = 0
  let count = 0
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x
      const laplacian = grayscale[index - width] + grayscale[index - 1] - 4 * grayscale[index] + grayscale[index + 1] + grayscale[index + width]
      total += laplacian
      count += 1
    }
  }
  const mean = total / count
  let variance = 0
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x
      const laplacian = grayscale[index - width] + grayscale[index - 1] - 4 * grayscale[index] + grayscale[index + 1] + grayscale[index + width]
      variance += (laplacian - mean) ** 2
    }
  }
  return variance / count
}

async function analyzeImage(dataUrl: string): Promise<PredictResponse> {
  const image = await createImageBitmap(await (await fetch(dataUrl)).blob())
  const canvas = new OffscreenCanvas(IMAGE_SIZE, IMAGE_SIZE)
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Image processing is unavailable')

  context.drawImage(image, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
  image.close()
  const pixels = context.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE)
  const blurVarianceValue = blurVariance(pixels.data, IMAGE_SIZE, IMAGE_SIZE)
  const metadata = {
    architecture: 'MobileNetV2',
    temperature: LOCAL_TEMPERATURE,
    validation_auc: 0.942,
    calibration_ece: 0.0496,
    blur_threshold: LOCAL_BLUR_THRESHOLD,
    confidence_threshold: LOCAL_CONFIDENCE_THRESHOLD,
    malignant_threshold: LOCAL_MALIGNANT_THRESHOLD,
  }

  if (blurVarianceValue < LOCAL_BLUR_THRESHOLD) {
    return { gate: 1, status: 'blur_error', blur_variance: blurVarianceValue, confidence: null, label: null, icd10: null, model_metadata: metadata }
  }

  const input = new Float32Array(3 * IMAGE_SIZE * IMAGE_SIZE)
  const means = [0.485, 0.456, 0.406]
  const deviations = [0.229, 0.224, 0.225]
  for (let index = 0; index < IMAGE_SIZE * IMAGE_SIZE; index += 1) {
    const pixel = index * 4
    input[index] = (pixels.data[pixel] / 255 - means[0]) / deviations[0]
    input[IMAGE_SIZE * IMAGE_SIZE + index] = (pixels.data[pixel + 1] / 255 - means[1]) / deviations[1]
    input[2 * IMAGE_SIZE * IMAGE_SIZE + index] = (pixels.data[pixel + 2] / 255 - means[2]) / deviations[2]
  }

  const session = await getSession()
  const output = await session.run(inferenceInput(input))
  const probability = Number((output.prob ?? output[Object.keys(output)[0]]).data[0])
  const confidence = Math.max(probability, 1 - probability)
  if (confidence < LOCAL_CONFIDENCE_THRESHOLD && probability < LOCAL_MALIGNANT_THRESHOLD) {
    return { gate: 2, status: 'low_confidence', blur_variance: blurVarianceValue, confidence, label: null, icd10: null, model_metadata: metadata }
  }

  const malignant = probability >= LOCAL_MALIGNANT_THRESHOLD
  return {
    gate: 0,
    status: 'success',
    blur_variance: blurVarianceValue,
    confidence,
    malignant_probability: probability,
    label: malignant ? 'Melanoma' : 'Benign Nevus',
    icd10: malignant ? 'C43.9' : 'D22.9',
    model_metadata: metadata,
  }
}

workerScope.onmessage = async (event) => {
  const { id, type } = event.data
  try {
    if (type === 'warm') await getSession()
    else {
      const result = await analyzeImage(event.data.dataUrl)
      workerScope.postMessage({ id, result })
      return
    }
    workerScope.postMessage({ id })
  } catch (error) {
    workerScope.postMessage({ id, error: error instanceof Error ? error.message : 'On-device inference failed' })
  }
}