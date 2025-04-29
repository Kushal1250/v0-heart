import { type NextRequest, NextResponse } from "next/server"
import { runPrediction, fallbackPrediction, type PredictionInput } from "@/lib/prediction"
import { saveToHistory } from "@/lib/user-specific-storage"

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
      "thalach",
      "exang",
      "oldpeak",
      "slope",
      "ca",
      "thal",
    ]

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === "") {
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

    // If we have an email, save the assessment to local storage for that email
    if (userEmail) {
      try {
        // Save assessment to user's email-specific history
        saveToHistory(userEmail, {
          ...body,
          result: predictionResult,
        })
        console.log(`Prediction saved for email ${userEmail} with result ${JSON.stringify(predictionResult)}`)
      } catch (storageError) {
        console.error("Error saving to local storage:", storageError)
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
