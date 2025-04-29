/**
 * Simplified history storage system
 * This provides a more reliable way to store and retrieve assessment history
 */

// Type definition for assessment history item
export interface AssessmentHistoryItem {
  id: string
  timestamp: number | string
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
const CURRENT_EMAIL_KEY = "currentUserEmail"

/**
 * Save the current user's email
 */
export function saveCurrentEmail(email: string): void {
  if (!email) return
  try {
    localStorage.setItem(CURRENT_EMAIL_KEY, email.toLowerCase())
    console.log(`Current email saved: ${email}`)
  } catch (error) {
    console.error("Error saving current email:", error)
  }
}

/**
 * Get the current user's email
 */
export function getCurrentEmail(): string | null {
  try {
    // Try to get from localStorage
    return localStorage.getItem(CURRENT_EMAIL_KEY)
  } catch (error) {
    console.error("Error getting current email:", error)
    return null
  }
}

/**
 * Get the storage key for a specific email
 */
function getStorageKey(email: string): string {
  return `assessmentHistory_${email.toLowerCase()}`
}

/**
 * Save assessment to history
 */
export function saveAssessment(email: string, assessment: any): void {
  if (!email || !assessment) {
    console.error("Cannot save assessment: missing email or assessment data")
    return
  }

  try {
    // Get existing history
    const history = getAssessmentHistory(email)

    // Ensure assessment has an ID
    if (!assessment.id) {
      assessment.id = generateId()
    }

    // Ensure assessment has a timestamp
    if (!assessment.timestamp) {
      assessment.timestamp = new Date().toISOString()
    }

    // Add to beginning of history
    history.unshift(assessment)

    // Save back to localStorage
    const storageKey = getStorageKey(email)
    localStorage.setItem(storageKey, JSON.stringify(history))

    console.log(`Assessment saved for ${email}`, assessment)
    console.log(`Total history items: ${history.length}`)
  } catch (error) {
    console.error("Error saving assessment:", error)
  }
}

/**
 * Get history for a specific email
 */
export function getAssessmentHistory(email: string): any[] {
  if (!email) return []

  try {
    const storageKey = getStorageKey(email)
    const historyJson = localStorage.getItem(storageKey)

    if (!historyJson) {
      console.log(`No history found for ${email} at key ${storageKey}`)
      return []
    }

    const history = JSON.parse(historyJson)
    if (!Array.isArray(history)) {
      console.error(`History for ${email} is not an array:`, history)
      return []
    }

    console.log(`Retrieved ${history.length} history items for ${email}`)
    return history
  } catch (error) {
    console.error(`Error retrieving history for ${email}:`, error)
    return []
  }
}

/**
 * Delete a specific history item
 */
export function deleteHistoryItem(email: string, id: string): void {
  if (!email || !id) return

  try {
    const history = getAssessmentHistory(email)
    const updatedHistory = history.filter((item) => item.id !== id)

    const storageKey = getStorageKey(email)
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory))

    console.log(`Deleted history item ${id} for ${email}`)
  } catch (error) {
    console.error("Error deleting history item:", error)
  }
}

/**
 * Clear all history for a specific email
 */
export function clearAssessmentHistory(email: string): void {
  if (!email) return

  try {
    const storageKey = getStorageKey(email)
    localStorage.removeItem(storageKey)
    console.log(`Cleared all history for ${email}`)
  } catch (error) {
    console.error("Error clearing history:", error)
  }
}

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
    const historyKeys = allKeys.filter((key) => key.startsWith("assessmentHistory_"))
    console.log("History keys:", historyKeys)

    // Show history for each key
    historyKeys.forEach((key) => {
      try {
        const email = key.replace("assessmentHistory_", "")
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
      (key) =>
        key.includes("assessment_history") ||
        key.includes("heart_assessment_history") ||
        key.startsWith(HISTORY_KEY_PREFIX),
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
          email = getCurrentEmail() || "guest@example.com"
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
