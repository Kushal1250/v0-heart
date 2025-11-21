import fs from "fs"
import path from "path"
import { execSync } from "child_process"

async function downloadCSV() {
  console.log("[v0] Downloading heart disease dataset...")

  const fetch_ = (await import("node-fetch")).default
  const url = "/images/heart-disease-data.csv"

  try {
    const response = await fetch_(url)
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`)
    }

    const buffer = await response.buffer()
    const csvPath = path.join(process.cwd(), "heart_disease_data.csv")
    fs.writeFileSync(csvPath, buffer)
    console.log("[v0] Dataset downloaded successfully!")
    return true
  } catch (error) {
    console.error("[v0] Error downloading dataset:", error)
    return false
  }
}

async function trainModel() {
  console.log("[v0] Training model with Python...")

  const pythonScript = `
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib
import os
import json

try:
    # Load dataset
    df = pd.read_csv("heart_disease_data.csv")
    
    # Check if we have the right columns
    if len(df.columns) < 14:
        print("Error: Dataset doesn't have enough columns")
        exit(1)
    
    # Use first 13 columns as features, last as target
    X = df.iloc[:, :13]
    y = df.iloc[:, -1]
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train the model
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)
    
    # Create model directory
    model_path = os.path.join(os.getcwd(), "public", "model")
    os.makedirs(model_path, exist_ok=True)
    
    # Save the model
    model_file = os.path.join(model_path, "trained_model.pkl")
    joblib.dump(model, model_file)
    
    # Save metrics
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    metrics = {
        "train_accuracy": float(train_score),
        "test_accuracy": float(test_score),
        "model_file": model_file
    }
    
    metrics_file = os.path.join(model_path, "metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(metrics, f)
    
    print("SUCCESS: Model trained and saved!")
    print(json.dumps(metrics))
    
except Exception as e:
    print(f"ERROR: {str(e)}")
    exit(1)
`

  try {
    const scriptPath = path.join(process.cwd(), "train_script.py")
    fs.writeFileSync(scriptPath, pythonScript)

    console.log("[v0] Installing Python dependencies...")
    execSync("pip install pandas scikit-learn joblib", { stdio: "inherit" })

    console.log("[v0] Running training script...")
    const result = execSync("python train_script.py", { encoding: "utf-8" })
    console.log("[v0] Python output:", result)

    // Cleanup
    fs.unlinkSync(scriptPath)

    console.log("[v0] Model training completed successfully!")
    return true
  } catch (error) {
    console.error("[v0] Error during model training:", error)
    return false
  }
}

async function main() {
  console.log("[v0] Starting model training pipeline...")

  try {
    const downloadSuccess = await downloadCSV()
    if (!downloadSuccess) {
      console.error("[v0] Dataset download failed, skipping training")
      return
    }

    const trainingSuccess = await trainModel()
    if (trainingSuccess) {
      console.log("[v0] Pipeline completed successfully!")
    } else {
      console.error("[v0] Training pipeline failed")
    }
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
  }
}

// Execute main function
main().catch(console.error)
