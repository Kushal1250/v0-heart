import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromRequest } from "@/lib/auth-utils"

// Type for prediction result
export type PredictionResult = {
  prediction: number
  probability: number
  riskLevel: string
  parameters?: any
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Log the incoming data for debugging
    console.log("Prediction request received:", data)

    // Get the current user
    const user = await getUserFromRequest(request)

    if (!user) {
      console.log("User not authenticated for prediction")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = user.id
    console.log(`Processing prediction for user ID: ${userId}`)

    // Validate the input data
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    // Process the prediction (this is a simplified example)
    // In a real application, you would use a machine learning model
    const result = calculateRisk(data)

    // Store the prediction in the database
    const predictionId = crypto.randomUUID()

    // Ensure the predictions table exists
    const sql = neon(process.env.DATABASE_URL!)
    await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        result DECIMAL NOT NULL,
        prediction_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insert the prediction
    await sql`
      INSERT INTO predictions (id, user_id, result, prediction_data)
      VALUES (${predictionId}, ${userId}, ${result.probability}, ${JSON.stringify(data)})
    `

    console.log(`Prediction saved with ID: ${predictionId}, score: ${result.probability}%`)

    return NextResponse.json({
      id: predictionId,
      riskLevel: result.risk,
      probability: result.probability,
      parameters: data,
    })
  } catch (error) {
    console.error("Error processing prediction:", error)
    return NextResponse.json({ error: "Failed to process prediction", details: String(error) }, { status: 500 })
  }
}

// Simple risk calculation function (for demonstration)
function calculateRisk(data: any): PredictionResult {
  // Extract relevant fields with defaults if missing
  const age = Number(data.age) || 50
  const sex = Number(data.sex) || 0
  const cp = Number(data.cp) || 0
  const trestbps = Number(data.trestbps) || 120
  const chol = Number(data.chol) || 200
  const fbs = Number(data.fbs) || 0
  const restecg = Number(data.restecg) || 0
  const thalach = Number(data.thalach) || 150
  const exang = Number(data.exang) || 0
  const oldpeak = Number(data.oldpeak) || 0
  const slope = Number(data.slope) || 0
  const ca = Number(data.ca) || 0
  const thal = Number(data.thal) || 0

  // Simple weighted calculation (this is not medically accurate)
  let score = 0

  // Age factor (higher age = higher risk)
  score += (age / 100) * 20

  // Sex factor (male = higher risk)
  score += sex === 1 ? 5 : 0

  // Chest pain type (higher = more severe)
  score += cp * 5

  // Blood pressure factor
  score += ((trestbps - 120) / 50) * 10

  // Cholesterol factor
  score += ((chol - 200) / 100) * 15

  // Fasting blood sugar factor
  score += fbs === 1 ? 5 : 0

  // ECG factor
  score += restecg * 5

  // Max heart rate factor (lower = higher risk)
  score += ((220 - age - thalach) / 60) * 10

  // Exercise induced angina
  score += exang === 1 ? 10 : 0

  // ST depression
  score += oldpeak * 10

  // Slope of ST segment
  score += slope * 5

  // Number of major vessels
  score += ca * 15

  // Thalassemia
  score += thal * 10

  // Normalize to 0-100 range and add some randomness
  score = Math.min(100, Math.max(0, score + (Math.random() * 20 - 10)))

  // Round to 1 decimal place
  const probability = Math.round(score * 10) / 10

  // Determine risk category
  let riskLevel = "low"
  if (probability > 70) {
    riskLevel = "high"
  } else if (probability > 40) {
    riskLevel = "moderate"
  }

  return {
    prediction: score >= 8 ? 1 : 0, // Adjusted threshold
    probability: probability,
    riskLevel: riskLevel,
  }
}
