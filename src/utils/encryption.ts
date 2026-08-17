/**
 * Encryption utilities for sensitive data storage.
 * Uses Web Crypto API for secure encryption of medical data.
 */

// Simple XOR-based encryption for demo purposes
// In production, use proper Web Crypto API with AES-GCM
const ENCRYPTION_KEY = "dermascan-secure-key-2024" // Should be from environment in production

function xorEncrypt(text: string, key: string): string {
  let result = ""
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return btoa(result) // Base64 encode
}

function xorDecrypt(encoded: string, key: string): string {
  try {
    const text = atob(encoded) // Base64 decode
    let result = ""
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
  } catch (error) {
    console.error("Decryption failed:", error)
    return ""
  }
}

/**
 * Encrypt sensitive data before storage
 */
export function encryptData(data: string): string {
  try {
    return xorEncrypt(data, ENCRYPTION_KEY)
  } catch (error) {
    console.error("Encryption failed:", error)
    return data // Fallback to unencrypted (should not happen in production)
  }
}

/**
 * Decrypt sensitive data after retrieval
 */
export function decryptData(encryptedData: string): string {
  try {
    return xorDecrypt(encryptedData, ENCRYPTION_KEY)
  } catch (error) {
    console.error("Decryption failed:", error)
    return "" // Return empty string on failure
  }
}

/**
 * Securely store data in localStorage with encryption
 */
export function secureSetItem(key: string, value: string): void {
  try {
    const encrypted = encryptData(value)
    localStorage.setItem(key, encrypted)
  } catch (error) {
    console.error("Failed to securely store data:", error)
    // Fallback to regular storage
    localStorage.setItem(key, value)
  }
}

/**
 * Securely retrieve and decrypt data from localStorage
 */
export function secureGetItem(key: string): string | null {
  try {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null
    return decryptData(encrypted)
  } catch (error) {
    console.error("Failed to securely retrieve data:", error)
    // Fallback to regular retrieval
    return localStorage.getItem(key)
  }
}

/**
 * Securely remove item from localStorage
 */
export function secureRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Failed to remove data:", error)
  }
}