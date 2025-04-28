import PDFDocument from "pdfkit"
import type { PredictionResult } from "@/app/api/predict/route"

export async function generateEnhancedPDF(
  predictionData: PredictionResult,
  userName = "Anonymous User",
  phoneNumber = "",
): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: "Heart Health Assessment Report",
        Author: "Heart Disease Predictor",
      },
    })

    const buffers: Buffer[] = []
    doc.on("data", buffers.push.bind(buffers))
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers)
      resolve(pdfData)
    })

    // Add title
    doc.fontSize(24).font("Helvetica-Bold").text("Health Assessment Results", { align: "center" })
    doc.moveDown(1)

    // Add patient information section - Fix: Use the actual userName instead of hardcoded "Patient"
    doc.fontSize(14).font("Helvetica-Bold").text(`Patient: ${userName}`)

    if (phoneNumber) {
      doc.fontSize(12).font("Helvetica").text(`Phone No: ${phoneNumber}`)
    }

    const now = new Date()
    doc.fontSize(12).font("Helvetica").text(`Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`)

    doc.moveDown(1)

    // Add risk level and score
    doc.fontSize(16).font("Helvetica-Bold").text(`Risk Level: ${predictionData.riskLevel}`)

    doc.fontSize(16).font("Helvetica-Bold").text(`Risk Score: ${predictionData.probability}%`)

    doc.moveDown(1)

    // Add basic health metrics
    doc.fontSize(14).font("Helvetica-Bold").text("Basic Health Metrics:")
    doc.fontSize(12).font("Helvetica")
    doc.text(`- Age: ${predictionData.age} years`)
    doc.text(`- Gender: ${predictionData.sex === 1 ? "Male" : "Female"}`)
    doc.text(`- Blood Pressure: ${predictionData.trestbps} mm Hg`)
    doc.text(`- Cholesterol: ${predictionData.chol} mg/dl`)
    doc.moveDown(1)

    // Add advanced parameters
    doc.fontSize(14).font("Helvetica-Bold").text("Advanced Parameters:")
    doc.fontSize(12).font("Helvetica")

    // Chest pain type
    let chestPainType = "Typical angina"
    if (predictionData.cp === 1) chestPainType = "Atypical angina"
    else if (predictionData.cp === 2) chestPainType = "Non-anginal pain"
    else if (predictionData.cp === 3) chestPainType = "Asymptomatic"
    doc.text(`- Chest Pain Type: ${chestPainType}`)

    // Fasting blood sugar
    doc.text(`- Fasting Blood Sugar: ${predictionData.fbs === 1 ? "> 120 mg/dl" : "≤ 120 mg/dl"}`)

    // Resting ECG
    let restingECG = "Normal"
    if (predictionData.restecg === 1) restingECG = "ST-T wave abnormality"
    else if (predictionData.restecg === 2) restingECG = "Left ventricular hypertrophy"
    doc.text(`- Resting ECG: ${restingECG}`)

    doc.text(`- Max Heart Rate: ${predictionData.thalach}`)
    doc.text(`- Exercise Induced Angina: ${predictionData.exang === 1 ? "Yes" : "No"}`)
    doc.text(`- ST Depression: ${predictionData.oldpeak}`)

    // ST Slope
    let stSlope = "Upsloping"
    if (predictionData.slope === 1) stSlope = "Flat"
    else if (predictionData.slope === 2) stSlope = "Downsloping"
    doc.text(`- ST Slope: ${stSlope}`)

    doc.text(`- Number of Major Vessels: ${predictionData.ca}`)

    // Thalassemia
    let thal = "Normal"
    if (predictionData.thal === 1) thal = "Fixed defect"
    else if (predictionData.thal === 2) thal = "Reversible defect"
    doc.text(`- Thalassemia: ${thal}`)

    doc.moveDown(1)

    // Add lifestyle factors if available
    if (predictionData.foodHabits || predictionData.junkFood || predictionData.sleepingHours) {
      doc.fontSize(14).font("Helvetica-Bold").text("Lifestyle Factors:")
      doc.fontSize(12).font("Helvetica")

      if (predictionData.foodHabits) {
        doc.text(`- Food Habits: ${predictionData.foodHabits}`)
      }

      if (predictionData.junkFood) {
        doc.text(`- Junk Food Consumption: ${predictionData.junkFood}`)
      }

      if (predictionData.sleepingHours) {
        doc.text(`- Sleeping Hours: ${predictionData.sleepingHours} hours/day`)
      } else {
        doc.text(`- Sleeping Hours: N/A hours/day`)
      }

      doc.moveDown(1)
    }

    // Add disclaimer
    doc.moveDown(1)
    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text("This assessment is not a medical diagnosis. Please consult with a healthcare provider.")

    doc.end()
  })
}
