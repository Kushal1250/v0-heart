import { promises as fs } from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Type for prediction input data
export type PredictionInput = {
  age: string | number
  sex: string | number
  cp: string | number
  trestbps: string | number
  chol: string | number
  fbs: string | number
  restecg: string | number
  thalach: string | number
  exang: string | number
  oldpeak: string | number
  slope: string | number
  ca: string | number
  thal: string | number
  foodHabits?: string
  junkFoodConsumption?: string
  sleepingHours?: string | number
  [key: string]: any
}

// Type for prediction result
export type PredictionResult = {
  prediction: number
  probability: number
}

// Function to run Python prediction script
export async function runPrediction(inputData: PredictionInput): Promise<PredictionResult> {
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
  float(input_data.get("foodHabits", 0)),
  float(input_data.get("junkFoodConsumption", 0)),
  float(input_data.get("sleepingHours", 7))
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
export function fallbackPrediction(data: PredictionInput): PredictionResult {
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
