import { createPrediction } from "./db"

/**
 * Saves assessment data to the server database
 * @param assessmentData The assessment data to save
 * @returns Promise resolving to the saved assessment or null if failed
 */
export async function saveAssessmentToServer(assessmentData: any): Promise<any> {
  try {
    // Check if we have the user ID and assessment data
    if (!assessmentData?.user_id || !assessmentData?.result) {
      console.error("Cannot save assessment: missing user ID or result data")
      return null
    }

    // Format the prediction data for database storage
    const result = {
      score: assessmentData.result.score || 0,
      risk: assessmentData.result.risk || "unknown",
      hasDisease: assessmentData.result.hasDisease || false,
    }

    // Create the prediction in the database
    const savedPrediction = await createPrediction(assessmentData.user_id, result, assessmentData)

    console.log("Assessment saved to database:", savedPrediction)
    return savedPrediction
  } catch (error) {
    console.error("Error saving assessment to server:", error)
    return null
  }
}

export function saveAssessmentToHistory(assessment: any): void {
  if (typeof window === "undefined") return

  try {
    // Get the user's email from multiple possible sources
    const email =
      localStorage.getItem("currentUserEmail") || localStorage.getItem("heart_current_user_email") || "user@example.com"

    if (!email) {
      console.error("No email found for saving assessment")
      return
    }

    // Add ID and timestamp if missing
    if (!assessment.id) {
      assessment.id = Math.random().toString(36).substring(2, 15)
    }
    if (!assessment.timestamp) {
      assessment.timestamp = Date.now()
    }

    // Save to predictionResult for immediate access
    localStorage.setItem("predictionResult", JSON.stringify(assessment))

    // Get existing history from multiple possible keys
    const historyKeys = [
      `assessmentHistory_${email}`,
      `heart_assessment_history_${email}`,
      `heart_assessment_history_${email.toLowerCase()}`,
    ]

    let history: any[] = []

    // Try to find existing history
    for (const key of historyKeys) {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed)) {
            history = parsed
            break
          }
        } catch (e) {
          console.error(`Error parsing history from ${key}:`, e)
        }
      }
    }

    // Add new assessment to the beginning
    const updatedHistory = [assessment, ...history]

    // Save to all history keys for compatibility
    for (const key of historyKeys) {
      localStorage.setItem(key, JSON.stringify(updatedHistory))
    }

    console.log(`Saved assessment to history for ${email}`)
  } catch (error) {
    console.error("Error saving assessment to history:", error)
  }
}

/**
 * Save assessment data to both server and local history
 * @param formData The form data submitted by the user
 * @param predictionResult The prediction result from the API
 * @returns The saved assessment data
 */
export async function saveAssessment(formData: any, predictionResult: any): Promise<any> {
  try {
    // Prepare assessment data
    const assessment = {
      ...formData,
      result: predictionResult,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(2, 15),
    }

    // Save to local history
    saveAssessmentToHistory(assessment)

    // If user is logged in, save to server
    if (formData.user_id) {
      await saveAssessmentToServer({
        ...assessment,
        user_id: formData.user_id,
      })
    }

    return assessment
  } catch (error) {
    console.error("Error saving assessment:", error)
    return null
  }
}
