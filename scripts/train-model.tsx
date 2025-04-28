"use nodejs"

import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Install required packages
console.log("Installing required packages...")
execSync("npm install csv-parser axios joblib @tensorflow/tfjs-node")

import axios from "axios"
import { createWriteStream } from "fs"

async function downloadCSV() {
  console.log("Downloading heart disease dataset...")
  const url =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/heart_disease_data-gcbBmwhbGDkcyqLAyqL7lpoRUCac53.csv"
  const writer = createWriteStream(path.join(process.cwd(), "heart_disease_data.csv"))

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve)
    writer.on("error", reject)
  })
}

async function trainModel() {
  console.log("Training model...")
  // We'll use Python for training as it's more suitable for ML tasks
  const pythonScript = `
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Load dataset
df = pd.read_csv("heart_disease_data.csv")
X = df.iloc[:, :13]
y = df["target"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2, random_state=0)

# Train the model
model = LogisticRegression()
model.fit(X_train, y_train)

# Save the model to a file
model_path = os.path.join(os.getcwd(), "public", "model")
os.makedirs(model_path, exist_ok=True)
joblib.dump(model, os.path.join(model_path, "trained_model.pkl"))

print("Model trained and saved successfully!")
  `

  fs.writeFileSync("train_script.py", pythonScript)

  try {
    execSync("pip install pandas scikit-learn joblib")
    execSync("python train_script.py")
    console.log("Model trained successfully!")
  } catch (error) {
    console.error("Error training model:", error)
  }
}

async function main() {
  try {
    await downloadCSV()
    await trainModel()
    console.log("Setup completed successfully!")
  } catch (error) {
    console.error("Error during setup:", error)
  }
}

main()
