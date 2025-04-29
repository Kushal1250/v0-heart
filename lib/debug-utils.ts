/**
 * Utility functions for debugging history and storage issues
 */

// Inspect localStorage contents
export function inspectLocalStorage(): Record<string, any> {
  if (typeof window === "undefined") return {}

  const storageSnapshot: Record<string, any> = {}

  try {
    // Get all keys
    const keys = Object.keys(localStorage)
    console.log("All localStorage keys:", keys)

    // Get heart-related keys
    const heartKeys = keys.filter((k) => k.includes("heart"))
    console.log("Heart-related keys:", heartKeys)

    // Get values for heart-related keys
    heartKeys.forEach((key) => {
      try {
        const rawValue = localStorage.getItem(key)
        storageSnapshot[key] = rawValue

        // Try to parse JSON if possible
        try {
          const parsedValue = JSON.parse(rawValue || "")
          storageSnapshot[`${key} (parsed)`] = parsedValue
        } catch (e) {
          // Not JSON, just store the raw value
        }
      } catch (e) {
        storageSnapshot[key] = `[Error reading: ${e.message}]`
      }
    })

    return storageSnapshot
  } catch (error) {
    console.error("Error inspecting localStorage:", error)
    return { error: error.message }
  }
}

// Fix common issues with history storage
export function repairHistoryStorage(email: string): boolean {
  if (typeof window === "undefined" || !email) return false

  try {
    const lowercaseEmail = email.toLowerCase()
    const expectedKey = `heart_assessment_history_${lowercaseEmail}`

    // Check for incorrect case variants
    const keys = Object.keys(localStorage)
    const possibleMatches = keys.filter(
      (k) =>
        k.toLowerCase().includes("heart") &&
        k.toLowerCase().includes("history") &&
        k.toLowerCase().includes(lowercaseEmail),
    )

    if (possibleMatches.length > 0 && !possibleMatches.includes(expectedKey)) {
      console.log(`Found possible matching keys: ${possibleMatches.join(", ")}`)

      // Take the first match and normalize it
      const matchData = localStorage.getItem(possibleMatches[0])
      if (matchData) {
        console.log(`Moving data from ${possibleMatches[0]} to the correct key ${expectedKey}`)
        localStorage.setItem(expectedKey, matchData)
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Error repairing history storage:", error)
    return false
  }
}
