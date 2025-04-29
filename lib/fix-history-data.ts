/**
 * Utility function to help fix history data issues
 */
export function fixHistoryData(email: string): boolean {
  try {
    // Check if there's any history data in localStorage
    const keys = Object.keys(localStorage)
    const historyKeys = keys.filter((key) => key.includes("history") && key.includes(email))

    console.log("Found history keys:", historyKeys)

    if (historyKeys.length === 0) {
      console.log("No history keys found for this email")
      return false
    }

    // Try to fix any corrupted data
    let fixedAny = false

    historyKeys.forEach((key) => {
      try {
        const data = localStorage.getItem(key)
        if (!data) return

        // Try to parse the data
        const parsed = JSON.parse(data)

        // If it's not an array, try to fix it
        if (!Array.isArray(parsed)) {
          console.log("Found non-array data, attempting to fix:", key)

          // If it's an object with a results property that's an array
          if (parsed && typeof parsed === "object" && Array.isArray(parsed.results)) {
            localStorage.setItem(key, JSON.stringify(parsed.results))
            fixedAny = true
          }
        }
      } catch (e) {
        console.error("Error fixing data for key:", key, e)
      }
    })

    return fixedAny
  } catch (e) {
    console.error("Error in fixHistoryData:", e)
    return false
  }
}
