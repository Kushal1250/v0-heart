// Type for assessment history item
export type HistoryItem = {
  id: string
  timestamp: number
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
    return historyJson ? JSON.parse(historyJson) : []
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
  } catch (error) {
    console.error("Error clearing history:", error)
  }
}

// Generate a unique ID for history items
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
