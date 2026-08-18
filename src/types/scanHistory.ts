import type { PredictResponse } from '../App'
import { Preferences } from '@capacitor/preferences'
import { Capacitor } from '@capacitor/core'
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

// Storage abstraction layer - uses Capacitor Preferences on native, localStorage on web
const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value })
    } else {
      secureSetItem(key, value)
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key })
      return value
    } else {
      return secureGetItem(key)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key })
    } else {
      secureRemoveItem(key)
    }
  }
}

export async function saveScan(record: ScanRecord): Promise<void> {
  try {
    const history = await getScanHistory()
    history.unshift(record) // Add to beginning
    // Keep only last 50 scans
    if (history.length > 50) {
      history.pop()
    }
    // Encrypt sensitive medical data before storage
    const encryptedData = JSON.stringify(history)
    await storage.setItem(STORAGE_KEY, encryptedData)
  } catch (error) {
    console.error('Failed to save scan:', error)
  }
}

export async function getScanHistory(): Promise<ScanRecord[]> {
  try {
    const encryptedData = await storage.getItem(STORAGE_KEY)
    if (!encryptedData) return []
    return JSON.parse(encryptedData)
  } catch (error) {
    console.error('Failed to load scan history:', error)
    return []
  }
}

export async function deleteScan(id: string): Promise<void> {
  try {
    const history = await getScanHistory()
    const filtered = history.filter(record => record.id !== id)
    const encryptedData = JSON.stringify(filtered)
    await storage.setItem(STORAGE_KEY, encryptedData)
  } catch (error) {
    console.error('Failed to delete scan:', error)
  }
}

export async function getScanById(id: string): Promise<ScanRecord | null> {
  const history = await getScanHistory()
  return history.find(record => record.id === id) || null
}

export async function clearScanHistory(): Promise<void> {
  try {
    await storage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear scan history:', error)
  }
}
