import { safeLocalStorage } from "@/lib/safe-client-utils"

// Type definition for assessment history item
export interface AssessmentHistoryItem {
  id: string
  date: string
  result: {
    risk: "low" | "moderate" | "high"
    score: number
    hasDisease: boolean
  }
  age: string
  sex: string
  trestbps: string // Blood pressure
  chol: string // Cholesterol
  // Include other relevant fields
  cp?: string
  fbs?: string
  restecg?: string
  thalach?: string
  exang?: string
  oldpeak?: string
  slope?: string
  ca?: string
  thal?: string
  foodHabits?: string
  junkFoodConsumption?: string
  sleepingHours?: string
}

// Maximum number of history items to store
const MAX_HISTORY_ITEMS = 20

// Key for localStorage
const HISTORY_STORAGE_KEY = "heartpredict-assessment-history"

// Save assessment to history
export function saveToHistory(assessment: Omit<AssessmentHistoryItem, "id" | "date">): void {
  try {
    // Generate unique ID and add date
    const historyItem: AssessmentHistoryItem = {
      ...assessment,
      id: generateId(),
      date: new Date().toISOString(),
    }

    // Get existing history
    const history = getHistory()

    // Add new item at the beginning
    history.unshift(historyItem)

    // Limit the number of items
    if (history.length > MAX_HISTORY_ITEMS) {
      history.length = MAX_HISTORY_ITEMS
    }

    // Save back to localStorage
    safeLocalStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error("Error saving assessment to history:", error)
  }
}

// Get all history items
export function getHistory(): AssessmentHistoryItem[] {
  try {
    const historyJson = safeLocalStorage.getItem(HISTORY_STORAGE_KEY)
    if (!historyJson) return []
    return JSON.parse(historyJson)
  } catch (error) {
    console.error("Error retrieving assessment history:", error)
    return []
  }
}

// Delete a specific history item
export function deleteHistoryItem(id: string): void {
  try {
    const history = getHistory()
    const updatedHistory = history.filter((item) => item.id !== id)
    safeLocalStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Error deleting history item:", error)
  }
}

// Clear all history
export function clearHistory(): void {
  try {
    safeLocalStorage.removeItem(HISTORY_STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing history:", error)
  }
}

// Filter history by risk level
export function filterHistoryByRisk(
  history: AssessmentHistoryItem[],
  risk: "low" | "moderate" | "high" | "all",
): AssessmentHistoryItem[] {
  if (risk === "all") return [...history]
  return history.filter((item) => item.result.risk === risk)
}

// Sort history by different criteria
export function sortHistory(
  history: AssessmentHistoryItem[],
  sortBy: "date-newest" | "date-oldest" | "risk-highest" | "risk-lowest" | "age-highest" | "age-lowest",
): AssessmentHistoryItem[] {
  const sortedHistory = [...history]

  switch (sortBy) {
    case "date-newest":
      return sortedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    case "date-oldest":
      return sortedHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    case "risk-highest":
      return sortedHistory.sort((a, b) => {
        const riskOrder = { high: 3, moderate: 2, low: 1 }
        return riskOrder[b.result.risk] - riskOrder[a.result.risk]
      })
    case "risk-lowest":
      return sortedHistory.sort((a, b) => {
        const riskOrder = { high: 3, moderate: 2, low: 1 }
        return riskOrder[a.result.risk] - riskOrder[b.result.risk]
      })
    case "age-highest":
      return sortedHistory.sort((a, b) => Number.parseInt(b.age) - Number.parseInt(a.age))
    case "age-lowest":
      return sortedHistory.sort((a, b) => Number.parseInt(a.age) - Number.parseInt(b.age))
    default:
      return sortedHistory
  }
}

// Helper function to generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
