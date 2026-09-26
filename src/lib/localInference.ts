import type { PredictResponse } from '../App'

type WorkerRequest = { id: number; type: 'warm' } | { id: number; type: 'analyze'; dataUrl: string }
type WorkerResponse = { id: number; result?: PredictResponse; error?: string }

let inferenceWorker: Worker | null = null
let nextRequestId = 0
const pendingRequests = new Map<number, { resolve: (value: PredictResponse | void) => void; reject: (error: Error) => void }>()

function getWorker() {
  if (inferenceWorker) return inferenceWorker

  const worker = new Worker(new URL('./localInference.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const pending = pendingRequests.get(event.data.id)
    if (!pending) return
    pendingRequests.delete(event.data.id)
    if (event.data.error) pending.reject(new Error(event.data.error))
    else pending.resolve(event.data.result)
  }
  worker.onerror = () => {
    const error = new Error('On-device inference worker failed')
    for (const pending of pendingRequests.values()) pending.reject(error)
    pendingRequests.clear()
    worker.terminate()
    inferenceWorker = null
  }
  inferenceWorker = worker
  return worker
}

function requestWorker(request: Omit<WorkerRequest, 'id'>): Promise<PredictResponse | void> {
  const id = ++nextRequestId
  return new Promise((resolve, reject) => {
    try {
      pendingRequests.set(id, { resolve, reject })
      getWorker().postMessage({ ...request, id } satisfies WorkerRequest)
    } catch (error) {
      pendingRequests.delete(id)
      reject(error instanceof Error ? error : new Error('On-device inference worker is unavailable'))
    }
  })
}

export async function warmLocalInference(): Promise<void> {
  await requestWorker({ type: 'warm' })
}

export async function analyzeImage(dataUrl: string): Promise<PredictResponse> {
  const result = await requestWorker({ type: 'analyze', dataUrl })
  if (!result) throw new Error('The inference worker returned no prediction')
  return result
}