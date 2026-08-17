import type { PredictResponse } from '../App'
import { secureSetItem, secureGetItem, secureRemoveItem } from '../utils/encryption'

export interface ScanRecord {
  id: string
  timestamp: number
  date: string
  result: PredictResponse
  imageData: string // base64 encoded image
  bodyLocation: BodyLocation
  notes?: string
}

export type BodyLocation = 
  | 'head'
  | 'neck'
  | 'chest'
  | 'back'
  | 'arm-left'
  | 'arm-right'
  | 'leg-left'
  | 'leg-right'
  | 'other'

export const BODY_LOCATION_LABELS: Record<BodyLocation, string> = {
  'head': 'Head/Scalp',
  'neck': 'Neck',
  'chest': 'Chest',
  'back': 'Back',
  'arm-left': 'Left Arm',
  'arm-right': 'Right Arm',
  'leg-left': 'Left Leg',
  'leg-right': 'Right Leg',
  'other': 'Other'
}

const STORAGE_KEY = 'dermascan_history'

export function saveScan(record: ScanRecord): void {
  try {
    const history = getScanHistory()
    history.unshift(record) // Add to beginning
    // Keep only last 50 scans
    if (history.length > 50) {
      history.pop()
    }
    // Encrypt sensitive medical data before storage
    const encryptedData = JSON.stringify(history)
    secureSetItem(STORAGE_KEY, encryptedData)
  } catch (error) {
    console.error('Failed to save scan:', error)
  }
}

export function getScanHistory(): ScanRecord[] {
  try {
    const encryptedData = secureGetItem(STORAGE_KEY)
    if (!encryptedData) return []
    return JSON.parse(encryptedData)
  } catch (error) {
    console.error('Failed to load scan history:', error)
    return []
  }
}

export function deleteScan(id: string): void {
  try {
    const history = getScanHistory()
    const filtered = history.filter(record => record.id !== id)
    const encryptedData = JSON.stringify(filtered)
    secureSetItem(STORAGE_KEY, encryptedData)
  } catch (error) {
    console.error('Failed to delete scan:', error)
  }
}

export function getScanById(id: string): ScanRecord | null {
  const history = getScanHistory()
  return history.find(record => record.id === id) || null
}

export function clearScanHistory(): void {
  try {
    secureRemoveItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear scan history:', error)
  }
}
