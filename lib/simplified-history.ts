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

    // Check for auth user in sessionStorage
    const authUserJson = sessionStorage.getItem("authUser")
    if (authUserJson) {
      try {
        const authUser = JSON.parse(authUserJson)
        if (authUser.email) return authUser.email
      } catch (e) {
        console.error("Error parsing auth user:", e)
      }
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
  if (typeof window === "undefined") return
  if (!email) return

  try {
    // Add ID and timestamp if missing
    if (!assessment.id) {
      assessment.id = Math.random().toString(36).substring(2, 15)
    }
    if (!assessment.timestamp) {
      assessment.timestamp = Date.now()
    }

    // Get existing history
    const history = getAssessmentHistory(email)

    // Add new assessment to the beginning
    const updatedHistory = [assessment, ...history]

    // Save to multiple storage keys for compatibility
    const historyKeys = [
      `assessmentHistory_${email}`,
      `heart_assessment_history_${email}`,
      `heart_assessment_history_${email.toLowerCase()}`,
    ]

    for (const key of historyKeys) {
      localStorage.setItem(key, JSON.stringify(updatedHistory))
    }

    console.log(`Saved assessment to history for ${email}`)
  } catch (error) {
    console.error("Error saving assessment:", error)
  }
}

// Get assessment history for a user
export function getAssessmentHistory(email: string): any[] {
  if (typeof window === "undefined") return []
  if (!email) return []

  try {
    // Try multiple storage keys
    const historyKeys = [
      `assessmentHistory_${email}`,
      `heart_assessment_history_${email}`,
      `heart_assessment_history_${email.toLowerCase()}`,
    ]

    for (const key of historyKeys) {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`Found history in key: ${key} with ${parsed.length} items`)
            return parsed
          }
        } catch (e) {
          console.error(`Error parsing data from ${key}:`, e)
        }
      }
    }

    // Check if we have a recent prediction
    const recentPrediction = localStorage.getItem("predictionResult")
    if (recentPrediction) {
      try {
        const prediction = JSON.parse(recentPrediction)
        if (prediction && prediction.result) {
          // Add ID and timestamp if missing
          if (!prediction.id) {
            prediction.id = Math.random().toString(36).substring(2, 15)
          }
          if (!prediction.timestamp) {
            prediction.timestamp = Date.now()
          }

          const history = [prediction]

          // Save this to all history keys
          for (const key of historyKeys) {
            localStorage.setItem(key, JSON.stringify(history))
          }
          console.log("Created history from recent prediction")
          return history
        }
      } catch (e) {
        console.error("Error using recent prediction:", e)
      }
    }

    return []
  } catch (error) {
    console.error("Error retrieving assessment history:", error)
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
 * Clear all history for a specific email
 */
export function clearHistory(email: string): void {
  clearAssessmentHistory(email)
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
