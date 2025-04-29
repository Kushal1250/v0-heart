// Type for assessment history item
export type HistoryItem = {
  id: string
  timestamp?: number
  date?: string
  result: {
    risk: "low" | "moderate" | "high"
    score: number
    hasDisease: boolean
  }
  age: string | number
  sex: string | number
  trestbps: string | number
  chol: string | number
  [key: string]: any
}

// Constants for storage keys
const CURRENT_USER_EMAIL_KEY = "heart_current_user_email"

// Get the storage key for a specific email
const getStorageKey = (email: string) => `heart_assessment_history_${email.toLowerCase()}`

// Get current user email from localStorage
export function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") return null // Skip on server

  try {
    return localStorage.getItem(CURRENT_USER_EMAIL_KEY)
  } catch (error) {
    console.error("Error getting current user email:", error)
    return null
  }
}

// Set current user email in localStorage
export function setCurrentUserEmail(email: string): void {
  if (typeof window === "undefined") return // Skip on server

  try {
    localStorage.setItem(CURRENT_USER_EMAIL_KEY, email)
  } catch (error) {
    console.error("Error setting current user email:", error)
  }
}

// Clear current user email from localStorage
export function clearCurrentUserEmail(): void {
  if (typeof window === "undefined") return // Skip on server

  try {
    localStorage.removeItem(CURRENT_USER_EMAIL_KEY)
  } catch (error) {
    console.error("Error clearing current user email:", error)
  }
}

// Save assessment to user's history
export function saveToHistory(email: string, assessment: any): void {
  if (typeof window === "undefined") return // Skip on server

  try {
    const storageKey = getStorageKey(email)
    const existingHistory = getHistoryByEmail(email)

    // Create new history item
    const newItem: HistoryItem = {
      id: generateId(),
      timestamp: Date.now(),
      ...assessment,
    }

    // Add to history and save
    const updatedHistory = [newItem, ...existingHistory]
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
    console.log(`Saved assessment to history for ${email}`, updatedHistory)
  } catch (error) {
    console.error("Error saving to history:", error)
  }
}

// Get user's assessment history by email
export function getHistoryByEmail(email: string): HistoryItem[] {
  if (typeof window === "undefined") return [] // Return empty array on server
  if (!email) return []

  try {
    const storageKey = getStorageKey(email)
    const historyJson = localStorage.getItem(storageKey)

    // Debug logging
    console.log(`Getting history for ${email} with key ${storageKey}`)
    console.log(`Raw history data: ${historyJson}`)

    if (!historyJson) return []

    // Try to parse the JSON
    try {
      const parsedHistory = JSON.parse(historyJson)
      console.log(`Parsed history:`, parsedHistory)
      return Array.isArray(parsedHistory) ? parsedHistory : []
    } catch (parseError) {
      console.error("Error parsing history JSON:", parseError)
      return []
    }
  } catch (error) {
    console.error("Error retrieving history:", error)
    return []
  }
}

// Alias for getHistoryByEmail for backward compatibility
export function getHistory(email: string): HistoryItem[] {
  return getHistoryByEmail(email)
}

// Delete an assessment from history by email and item ID
export function deleteHistoryItem(email: string, id: string): void {
  if (typeof window === "undefined") return // Skip on server
  if (!email) return

  try {
    const storageKey = getStorageKey(email)
    const existingHistory = getHistoryByEmail(email)
    const updatedHistory = existingHistory.filter((item) => item.id !== id)
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
    console.log(`Deleted item ${id} from history for ${email}`)
  } catch (error) {
    console.error("Error deleting from history:", error)
  }
}

// Alias for deleteHistoryItem for backward compatibility
export function deleteFromHistory(email: string, id: string): void {
  deleteHistoryItem(email, id)
}

// Clear all history for a user
export function clearHistory(email: string): void {
  if (typeof window === "undefined") return // Skip on server
  if (!email) return

  try {
    const storageKey = getStorageKey(email)
    localStorage.removeItem(storageKey)
    console.log(`Cleared all history for ${email}`)
  } catch (error) {
    console.error("Error clearing history:", error)
  }
}

// Generate a unique ID for history items
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Add a debug function to help troubleshoot
export function debugStorage(email: string): void {
  if (typeof window === "undefined") return

  try {
    console.group("LocalStorage Debug")
    console.log("All localStorage keys:")
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      console.log(`${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`)
    }

    console.log("\nCurrent user email:", getCurrentUserEmail())

    if (email) {
      const storageKey = getStorageKey(email)
      console.log(`\nHistory for ${email} (key: ${storageKey}):`)
      console.log(localStorage.getItem(storageKey))
    }
    console.groupEnd()
  } catch (error) {
    console.error("Error debugging storage:", error)
  }
}
