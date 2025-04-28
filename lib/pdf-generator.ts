import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { PredictionResult } from "@/types/prediction"

export const generatePDF = (
  result: PredictionResult,
  userName = "Anonymous User",
  phoneNumber = "",
  includeDetails = true,
) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Add title
  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.text("Health Assessment Results", pageWidth / 2, 30, { align: "center" })

  // Add patient information
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(`Patient: ${userName}`, 20, 50)

  if (phoneNumber) {
    doc.text(`Phone No: ${phoneNumber}`, 20, 60)
  }

  // Add date
  const now = new Date()
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
  doc.setFont("helvetica", "normal")
  doc.text(`Generated on ${formattedDate} at ${formattedTime}`, 20, phoneNumber ? 70 : 60)

  // Add risk level
  const yPos = phoneNumber ? 90 : 80
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(`Risk Level: ${result.riskLevel}`, 20, yPos)

  // Add risk score
  doc.text(`Risk Score: ${result.probability}%`, 20, yPos + 20)

  let currentY = 0

  if (includeDetails && result.parameters) {
    // Basic Health Metrics
    currentY = yPos + 50
    doc.setFontSize(16)
    doc.text("Basic Health Metrics:", 20, currentY)
    currentY += 10

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    if (result.parameters.age) {
      doc.text(`- Age: ${result.parameters.age} years`, 30, currentY)
      currentY += 10
    }
    if (result.parameters.sex) {
      doc.text(`- Gender: ${result.parameters.sex === 1 ? "Male" : "Female"}`, 30, currentY)
      currentY += 10
    }
    if (result.parameters.trestbps) {
      doc.text(`- Blood Pressure: ${result.parameters.trestbps} mm Hg`, 30, currentY)
      currentY += 10
    }
    if (result.parameters.chol) {
      doc.text(`- Cholesterol: ${result.parameters.chol} mg/dl`, 30, currentY)
      currentY += 10
    }

    // Advanced Parameters
    currentY += 10
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Advanced Parameters:", 20, currentY)
    currentY += 10

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")

    if (result.parameters.cp !== undefined) {
      let chestPainType = ""
      switch (result.parameters.cp) {
        case 0:
          chestPainType = "Typical angina"
          break
        case 1:
          chestPainType = "Atypical angina"
          break
        case 2:
          chestPainType = "Non-anginal pain"
          break
        case 3:
          chestPainType = "Asymptomatic"
          break
        default:
          chestPainType = "Unknown"
      }
      doc.text(`- Chest Pain Type: ${chestPainType}`, 30, currentY)
      currentY += 10
    }

    if (result.parameters.fbs !== undefined) {
      doc.text(`- Fasting Blood Sugar: ${result.parameters.fbs === 1 ? "> 120 mg/dl" : "≤ 120 mg/dl"}`, 30, currentY)
      currentY += 10
    }

    if (result.parameters.restecg !== undefined) {
      let ecgResult = ""
      switch (result.parameters.restecg) {
        case 0:
          ecgResult = "Normal"
          break
        case 1:
          ecgResult = "ST-T wave abnormality"
          break
        case 2:
          ecgResult = "Left ventricular hypertrophy"
          break
        default:
          ecgResult = "Unknown"
      }
      doc.text(`- Resting ECG: ${ecgResult}`, 30, currentY)
      currentY += 10
    }

    if (result.parameters.thalach) {
      doc.text(`- Max Heart Rate: ${result.parameters.thalach}`, 30, currentY)
      currentY += 10
    }

    if (result.parameters.exang !== undefined) {
      doc.text(`- Exercise Induced Angina: ${result.parameters.exang === 1 ? "Yes" : "No"}`, 30, currentY)
      currentY += 10
    }

    if (result.parameters.oldpeak !== undefined) {
      doc.text(`- ST Depression: ${result.parameters.oldpeak}`, 30, currentY)
      currentY += 10
    }

    if (result.parameters.slope !== undefined) {
      let slopeType = ""
      switch (result.parameters.slope) {
        case 0:
          slopeType = "Upsloping"
          break
        case 1:
          slopeType = "Flat"
          break
        case 2:
          slopeType = "Downsloping"
          break
        default:
          slopeType = "Unknown"
      }
      doc.text(`- ST Slope: ${slopeType}`, 30, currentY)
      currentY += 10
    }

    if (result.parameters.ca !== undefined) {
      doc.text(`- Number of Major Vessels: ${result.parameters.ca}`, 30, currentY)
      currentY += 10
    }

    if (result.parameters.thal !== undefined) {
      let thalResult = ""
      switch (result.parameters.thal) {
        case 1:
          thalResult = "Normal"
          break
        case 2:
          thalResult = "Fixed defect"
          break
        case 3:
          thalResult = "Reversible defect"
          break
        default:
          thalResult = "Unknown"
      }
      doc.text(`- Thalassemia: ${thalResult}`, 30, currentY)
      currentY += 10
    }

    // Check if we need a new page for lifestyle factors
    if (currentY > 250) {
      doc.addPage()
      currentY = 30
    }

    // Lifestyle Factors (if available)
    if (result.parameters.foodHabits || result.parameters.junkFood || result.parameters.sleepingHours) {
      currentY += 10
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Lifestyle Factors:", 20, currentY)
      currentY += 10

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")

      if (result.parameters.foodHabits) {
        doc.text(`- Food Habits: ${result.parameters.foodHabits}`, 30, currentY)
        currentY += 10
      }

      if (result.parameters.junkFood) {
        doc.text(`- Junk Food Consumption: ${result.parameters.junkFood}`, 30, currentY)
        currentY += 10
      }

      if (result.parameters.sleepingHours) {
        doc.text(`- Sleeping Hours: ${result.parameters.sleepingHours} hours/day`, 30, currentY)
        currentY += 10
      }
    }
  }

  // Add disclaimer
  if (currentY > 250) {
    doc.addPage()
    currentY = 30
  } else {
    currentY += 20
  }

  doc.setFontSize(12)
  doc.setFont("helvetica", "italic")
  doc.text("This assessment is not a medical diagnosis. Please consult with a healthcare provider.", 20, currentY, {
    maxWidth: pageWidth - 40,
  })

  return doc
}
