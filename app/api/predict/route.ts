import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { getSessionToken, getUserIdFromToken } from "@/lib/auth-utils"
import { getUserById, createPrediction } from "@/lib/db"

const execAsync = promisify(exec)

// Function to run Python prediction script
async function runPrediction(inputData: any) {
  try {
    // Create a temporary Python script for prediction
    const scriptPath = path.join(process.cwd(), "temp_predict.py")
    const pythonScript = `
import joblib
import json
import os
import sys

# Load the model
model_path = os.path.join(os.getcwd(), "public", "model", "trained_model.pkl")
model = joblib.load(model_path)

# Parse input data
input_data = json.loads('''${JSON.stringify(inputData)}''')

# Prepare features in the correct order
features = [
   float(input_data["age"]),
   float(input_data["sex"]),
   float(input_data["cp"]),
   float(input_data["trestbps"]),
   float(input_data["chol"]),
   float(input_data["fbs"]),
   float(input_data["restecg"]),
   float(input_data["thalach"]),
   float(input_data["exang"]),
   float(input_data["oldpeak"]),
   float(input_data["slope"]),
   float(input_data["ca"]),
   float(input_data["thal"]),
   float(input_data["foodHabits"]),
   float(input_data["junkFoodConsumption"]),
   float(input_data["sleepingHours"])
]

# Make prediction
prediction = model.predict([features])[0]
probability = model.predict_proba([features])[0][1]  # Probability of heart disease

# Output result
result = {
   "prediction": int(prediction),
   "probability": float(probability)
}
print(json.dumps(result))
`

    await fs.writeFile(scriptPath, pythonScript)

    // Execute the Python script
    const { stdout } = await execAsync("python temp_predict.py")

    // Clean up
    await fs.unlink(scriptPath)

    // Parse and return the result
    try {
      return JSON.parse(stdout.trim())
    } catch (error) {
      console.error("Failed to parse prediction output:", error)
      throw new Error("Invalid prediction output format")
    }
  } catch (error) {
    console.error("Prediction error:", error)
    throw new Error("Failed to run prediction")
  }
}

// Fallback prediction function if Python execution fails
function fallbackPrediction(data: any) {
  // Simple risk calculation based on key factors
  let score = 0

  // Age factor
  const age = Number(data.age) || 0
  if (age > 50) score += 2
  if (age > 65) score += 2

  // Sex factor (males have higher risk statistically)
  if (data.sex === "1") score += 1

  // Chest pain type
  if (data.cp === "1" || data.cp === "2") score += 2

  // Blood pressure
  const bp = Number(data.trestbps) || 0
  if (bp > 120) score += 1
  if (bp > 140) score += 2

  // Cholesterol
  const chol = Number(data.chol) || 0
  if (chol > 200) score += 1
  if (chol > 240) score += 2

  // Exercise induced angina
  if (data.exang === "1") score += 2

  // Lifestyle factors
  // Junk food consumption
  if (data.junkFoodConsumption === "high") score += 1.5
  else if (data.junkFoodConsumption === "moderate") score += 0.5

  // Sleeping hours
  const sleepHours = Number(data.sleepingHours) || 7
  if (sleepHours < 6 || sleepHours > 9) score += 1

  // Food habits (slight impact)
  if (data.foodHabits === "non-vegetarian") score += 0.5

  // Calculate probability (simple approximation)
  const probability = Math.min(0.95, score / 18) // Adjusted max score

  return {
    prediction: score >= 8 ? 1 : 0, // Adjusted threshold
    probability: probability,
  }
}

export type PredictionResult = {
  riskLevel: "High" | "Moderate" | "Low"
  probability: number
  age: number
  sex: number
  trestbps: number
  chol: number
  cp: number
  fbs: number
  restecg: number
  thalach: number
  exang: number
  oldpeak: number
  slope: number
  ca: number
  thal: number
  foodHabits: string
  junkFood: string
  sleepingHours: number
}

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = [
      "age",
      "sex",
      "trestbps",
      "chol",
      "cp",
      "fbs",
      "restecg",
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

    // Get user ID from session token
    let userId = null
    try {
      const sessionToken = getSessionToken()
      if (sessionToken) {
        userId = await getUserIdFromToken(sessionToken)
      }

      // If we have a user ID, save the prediction to the database
      if (userId) {
        const user = await getUserById(userId)

        if (user) {
          // Save prediction to database
          await createPrediction(userId, predictionResult, body)
          console.log(`Prediction saved for user ${userId} with result ${JSON.stringify(predictionResult)}`)
        }
      }
    } catch (dbError) {
      // Log the error but don't fail the request
      console.error("Error saving prediction to database:", dbError)
    }

    return NextResponse.json({
      prediction: predictionResult,
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
