/**
 * Simplified history storage system
 * This provides a more reliable way to store and retrieve assessment history
 */

// Type definition for assessment history item
export interface AssessmentHistoryItem {
  id: string
  timestamp: number
  age: string | number
  sex: string | number
  trestbps: string | number
  chol: string | number
  cp?: string | number
  fbs?: string | number
  restecg?: string | number
  thalach?: string | number
  exang?: string | number
  oldpeak?: string | number
  slope?: string | number
  ca?: string | number
  thal?: string | number
  foodHabits?: string
  junkFoodConsumption?: string
  sleepingHours?: string
  result: {
    risk: "low" | "moderate" | "high"
    score: number
    hasDisease: boolean
  }
}

// Constants
const HISTORY_KEY_PREFIX = "heart_history_"
const CURRENT_EMAIL_KEY = "heart_current_email"

// Check if we're in a browser environment
const isBrowser = () => typeof window !== "undefined"

// Define the assessment type
export interface Assessment {
  id: string
  date: string
  risk: number
  inputs: Record<string, any>
}

// Get the current user email from localStorage or use a default
export const getCurrentUserEmail = (): string => {
  if (!isBrowser()) return "Default User"

  try {
    return localStorage.getItem("currentUserEmail") || "Default User"
  } catch (e) {
    console.error("Error getting current user email:", e)
    return "Default User"
  }
}

// Add a prediction to history
export const addPrediction = (prediction: Assessment): void => {
  if (!isBrowser()) return

  try {
    const email = getCurrentUserEmail()
    const key = `assessmentHistory_${email}`

    // Get existing history
    const existingHistory = getHistory()

    // Add new prediction
    const updatedHistory = [prediction, ...existingHistory]

    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(updatedHistory))
  } catch (e) {
    console.error("Error adding prediction to history:", e)
  }
}

// Get history from localStorage
export const getHistory = (): Assessment[] => {
  if (!isBrowser()) return []

  try {
    const email = getCurrentUserEmail()
    const key = `assessmentHistory_${email}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error("Error getting history:", e)
    return []
  }
}

// Delete an assessment by index
export const deleteAssessment = (index: number): boolean => {
  if (!isBrowser()) return false

  try {
    const email = getCurrentUserEmail()
    const key = `assessmentHistory_${email}`

    // Get existing history
    const history = getHistory()

    // Remove the assessment at the specified index
    if (index >= 0 && index < history.length) {
      history.splice(index, 1)

      // Save back to localStorage
      localStorage.setItem(key, JSON.stringify(history))
      return true
    }

    return false
  } catch (e) {
    console.error("Error deleting assessment:", e)
    return false
  }
}

// Clear all history
export const clearHistory = (): void => {
  if (!isBrowser()) return

  try {
    const email = getCurrentUserEmail()
    const key = `assessmentHistory_${email}`
    localStorage.removeItem(key)
  } catch (e) {
    console.error("Error clearing history:", e)
  }
}

// Change the current user email
export const changeUserEmail = (newEmail: string): void => {
  if (!isBrowser()) return

  try {
    localStorage.setItem("currentUserEmail", newEmail)
  } catch (e) {
    console.error("Error changing user email:", e)
  }
}

// Save the current user's email
export function saveCurrentEmail(email: string): void {
  try {
    localStorage.setItem("currentUserEmail", email)
    console.log("Current email saved:", email)
  } catch (error) {
    console.error("Error saving current email:", error)
  }
}

// Get the current user's email
export function getCurrentEmail(): string {
  try {
    // Try to get from localStorage first
    const email = localStorage.getItem("currentUserEmail")
    if (email) return email

    // If not found, check if we have a user object
    const userJson = localStorage.getItem("user")
    if (userJson) {
      const user = JSON.parse(userJson)
      if (user.email) return user.email
    }

    // Default fallback email if needed
    return "guest@example.com"
  } catch (error) {
    console.error("Error getting current email:", error)
    return "guest@example.com"
  }
}

// Save an assessment to history
export function saveAssessment(email: string, assessment: any): void {
  try {
    // Get existing history or create new array
    const historyKey = `assessmentHistory_${email}`
    const existingHistory = localStorage.getItem(historyKey)
    const history = existingHistory ? JSON.parse(existingHistory) : []

    // Add timestamp if not present
    if (!assessment.timestamp) {
      assessment.timestamp = new Date().toISOString()
    }

    // Add to history
    history.push(assessment)

    // Save back to localStorage
    localStorage.setItem(historyKey, JSON.stringify(history))
    console.log(`Assessment saved for ${email}. Total assessments: ${history.length}`)
  } catch (error) {
    console.error("Error saving assessment:", error)
  }
}

// Get assessment history for a user
export function getAssessmentHistory(email: string): any[] {
  try {
    const historyKey = `assessmentHistory_${email}`
    const existingHistory = localStorage.getItem(historyKey)
    return existingHistory ? JSON.parse(existingHistory) : []
  } catch (error) {
    console.error("Error getting assessment history:", error)
    return []
  }
}

// Clear assessment history for a user
export function clearAssessmentHistory(email: string): void {
  try {
    const historyKey = `assessmentHistory_${email}`
    localStorage.removeItem(historyKey)
    console.log(`Assessment history cleared for ${email}`)
  } catch (error) {
    console.error("Error clearing assessment history:", error)
  }
}

/**
 * Get the storage key for a specific email
 */
function getStorageKey(email: string): string {
  return `${HISTORY_KEY_PREFIX}${email.toLowerCase()}`
}

/**
 * Delete a specific history item
 */
export function deleteHistoryItem(email: string, id: string): void {
  if (!email || !id) return

  try {
    const history = getAssessmentHistory(email)
    const updatedHistory = history.filter((item) => item.id !== id)

    const historyKey = `assessmentHistory_${email}`
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory))

    console.log(`Deleted history item ${id} for ${email}`)
  } catch (error) {
    console.error("Error deleting history item:", error)
  }
}

/**
 * Delete a specific assessment by index
 */
export function deleteAssessmentByIndex(email: string, index: number): void {
  if (!email || index < 0) return

  try {
    const history = getAssessmentHistory(email)
    if (index >= history.length) return

    // Remove the item at the specified index
    history.splice(index, 1)

    // Save the updated history
    const historyKey = `assessmentHistory_${email}`
    localStorage.setItem(historyKey, JSON.stringify(history))

    console.log(`Deleted assessment at index ${index} for ${email}`)
  } catch (error) {
    console.error("Error deleting assessment by index:", error)
  }
}

/**
 * Clear all history for a specific email
 */
// export function clearHistory(email: string): void {
//   clearAssessmentHistory(email)
// }

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15)
}

/**
 * Debug function to inspect all history data
 */
export function debugHistory(): void {
  try {
    console.group("History Debug")

    // Get current email
    const currentEmail = getCurrentEmail()
    console.log("Current email:", currentEmail)

    // List all localStorage keys
    const allKeys = Object.keys(localStorage)
    console.log("All localStorage keys:", allKeys)

    // Find all history keys
    const historyKeys = allKeys.filter((key) => key.startsWith(HISTORY_KEY_PREFIX))
    console.log("History keys:", historyKeys)

    // Show history for each key
    historyKeys.forEach((key) => {
      try {
        const email = key.replace(HISTORY_KEY_PREFIX, "")
        const history = getAssessmentHistory(email)
        console.log(`History for ${email}:`, history)
      } catch (e) {
        console.error(`Error reading history for ${key}:`, e)
      }
    })

    console.groupEnd()
  } catch (error) {
    console.error("Error debugging history:", error)
  }
}

/**
 * Migrate old history data to new format
 */
export function migrateOldHistory(): boolean {
  try {
    console.log("Attempting to migrate old history data...")

    // Look for old history keys
    const allKeys = Object.keys(localStorage)
    const oldHistoryKeys = allKeys.filter(
      (key) => key.includes("assessment_history") || key.includes("heart_assessment_history"),
    )

    console.log("Found old history keys:", oldHistoryKeys)

    if (oldHistoryKeys.length === 0) {
      console.log("No old history data found")
      return false
    }

    let migrationCount = 0

    // Process each old key
    oldHistoryKeys.forEach((oldKey) => {
      try {
        const oldDataJson = localStorage.getItem(oldKey)
        if (!oldDataJson) return

        const oldData = JSON.parse(oldDataJson)
        if (!Array.isArray(oldData) || oldData.length === 0) return

        // Try to extract email from key
        let email = null
        if (oldKey.includes("_")) {
          const parts = oldKey.split("_")
          email = parts[parts.length - 1]

          // Check if it looks like an email
          if (!email.includes("@")) {
            email = null
          }
        }

        // If we couldn't extract email, use current email or default
        if (!email) {
          email = getCurrentEmail() || "user@example.com"
        }

        // Migrate each item
        oldData.forEach((item) => {
          saveAssessment(email, item)
          migrationCount++
        })

        console.log(`Migrated ${oldData.length} items from ${oldKey} to ${email}`)
      } catch (e) {
        console.error(`Error migrating data from ${oldKey}:`, e)
      }
    })

    console.log(`Migration complete. Migrated ${migrationCount} items.`)
    return migrationCount > 0
  } catch (error) {
    console.error("Error during migration:", error)
    return false
  }
}
