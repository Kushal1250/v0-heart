// Constants
const USER_EMAIL_KEY = "heart-predict-current-email"
const HISTORY_PREFIX = "heart-predict-history-"

// Types
export type AssessmentHistoryItem = {
  id: string
  date: string
  result: {
    risk: string
    score: number
    hasDisease: boolean
  }
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
  [key: string]: any
}

// Get current user email
export function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(USER_EMAIL_KEY)
}

// Set current user email
export function setCurrentUserEmail(email: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_EMAIL_KEY, email)
}

// Clear current user email
export function clearCurrentUserEmail(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(USER_EMAIL_KEY)
}

// Get history storage key for an email
function getHistoryKey(email: string): string {
  return `${HISTORY_PREFIX}${email.toLowerCase()}`
}

// Get history for a specific email
export function getHistoryByEmail(email: string): AssessmentHistoryItem[] {
  if (typeof window === "undefined") return []
  if (!email) return []

  try {
    const key = getHistoryKey(email)
    const storedHistory = localStorage.getItem(key)
    return storedHistory ? JSON.parse(storedHistory) : []
  } catch (error) {
    console.error("Error retrieving history:", error)
    return []
  }
}

// Save history for a specific email
export function saveHistoryByEmail(email: string, history: AssessmentHistoryItem[]): void {
  if (typeof window === "undefined") return
  if (!email) return

  try {
    const key = getHistoryKey(email)
    localStorage.setItem(key, JSON.stringify(history))
  } catch (error) {
    console.error("Error saving history:", error)
  }
}

// Add item to history for a specific email
export function addToHistory(email: string, item: AssessmentHistoryItem): void {
  if (typeof window === "undefined") return
  if (!email) return

  try {
    const history = getHistoryByEmail(email)
    history.push(item)
    saveHistoryByEmail(email, history)
  } catch (error) {
    console.error("Error adding to history:", error)
  }
}

// Delete item from history for a specific email
export function deleteHistoryItem(email: string, id: string): void {
  if (typeof window === "undefined") return
  if (!email) return

  try {
    const history = getHistoryByEmail(email)
    const updatedHistory = history.filter((item) => item.id !== id)
    saveHistoryByEmail(email, updatedHistory)
  } catch (error) {
    console.error("Error deleting history item:", error)
  }
}

// Clear all history for a specific email
export function clearHistory(email: string): void {
  if (typeof window === "undefined") return
  if (!email) return

  try {
    const key = getHistoryKey(email)
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Error clearing history:", error)
  }
}

// Backward compatibility functions
export function getHistory(email?: string): AssessmentHistoryItem[] {
  const userEmail = email || getCurrentUserEmail()
  return userEmail ? getHistoryByEmail(userEmail) : []
}

export function deleteFromHistory(email: string, id: string): void {
  deleteHistoryItem(email, id)
}

export function addItemToHistory(item: AssessmentHistoryItem): void {
  const userEmail = getCurrentUserEmail()
  if (userEmail) {
    addToHistory(userEmail, item)
  }
}

export function saveToHistory(assessment: Omit<AssessmentHistoryItem, "id" | "date">): void {
  if (typeof window === "undefined") return

  const userEmail = getCurrentUserEmail()
  if (!userEmail) {
    console.warn("No user email found, cannot save to history.")
    return
  }

  try {
    const historyKey = getHistoryKey(userEmail)
    let history: AssessmentHistoryItem[] = []

    const storedHistory = localStorage.getItem(historyKey)
    if (storedHistory) {
      history = JSON.parse(storedHistory)
    }

    const newAssessment = {
      ...assessment,
      id: Date.now().toString(), // Simple unique ID
      date: new Date().toISOString(),
    }

    history.push(newAssessment)

    localStorage.setItem(historyKey, JSON.stringify(history))
  } catch (error) {
    console.error("Error saving assessment to history:", error)
  }
}
