import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { runPrediction, fallbackPrediction, type PredictionInput } from "@/lib/prediction"
import { sql } from "@/lib/db"

export type PredictionResult = {
  prediction: number
  probability: number
}

export async function POST(request: NextRequest) {
  try {
    let body: PredictionInput & { userEmail?: string }
    try {
      body = await request.json()
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const sessionToken = (await cookies()).get("sessionToken")?.value
    let userId = null

    if (sessionToken) {
      try {
        const sessionResult = await sql`
          SELECT user_id FROM sessions WHERE token = $1 LIMIT 1
        `[sessionToken]
        if (sessionResult.length > 0) {
          userId = sessionResult[0].user_id
        }
      } catch (sessionError) {
        console.warn("Could not retrieve user from session:", sessionError)
      }
    }

    // Extract user email from the request
    const userEmail = body.userEmail || null

    // Validate required fields
    const requiredFields = [
      "age",
      "sex",
      "trestbps",
      "chol",
      "cp",
      "fbs",
      "restecg",
      "thalach", // Make sure thalach is included in required fields
      "exang",
      "oldpeak",
      "slope",
      "ca",
      "thal",
    ]

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === "" || body[field] === null) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Add artificial delay to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let result
    try {
      // Try to use the trained model
      result = await runPrediction(body)
    } catch (error) {
      console.warn("Falling back to simple prediction:", error)
      // Fall back to simple prediction if model fails
      result = fallbackPrediction(body)
    }

    // Map the prediction to risk levels
    let risk: "low" | "moderate" | "high" = "low"
    const probability = result.probability

    if (probability >= 0.7) {
      risk = "high"
    } else if (probability >= 0.3) {
      risk = "moderate"
    }

    const predictionResult = {
      risk,
      score: Math.round(probability * 100),
      hasDisease: result.prediction === 1,
    }

    if (userId) {
      try {
        const predictionData = {
          age: body.age,
          sex: body.sex,
          trestbps: body.trestbps,
          chol: body.chol,
          cp: body.cp,
          fbs: body.fbs,
          restecg: body.restecg,
          thalach: body.thalach,
          exang: body.exang,
          oldpeak: body.oldpeak,
          slope: body.slope,
          ca: body.ca,
          thal: body.thal,
          foodHabits: body.foodHabits,
          junkFoodConsumption: body.junkFoodConsumption,
          sleepingHours: body.sleepingHours,
        }

        await sql`
          INSERT INTO predictions (user_id, result, prediction_data, created_at)
          VALUES ($1, $2, $3, NOW())
        `[(userId, result.probability, JSON.stringify(predictionData))]

        console.log("[v0] Prediction saved to database for user:", userId)
      } catch (dbError) {
        console.error("Error saving prediction to database:", dbError)
        // Continue even if database save fails - don't block the user from getting their result
      }
    }

    return NextResponse.json({
      prediction: predictionResult,
      userEmail: userEmail, // Return the email to confirm
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json(
      {
        error: "Failed to process prediction",
        details: String(error),
        message: "Please try again or contact support if the issue persists.",
      },
      { status: 500 },
    )
  }
}
