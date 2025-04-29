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
