import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { email, predictionData, userName, phoneNumber } = await request.json()

    if (!email || !predictionData) {
      return NextResponse.json({ error: "Email and prediction data are required" }, { status: 400 })
    }

    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Format risk level for email subject
    const riskLevelText =
      predictionData.riskLevel === "High"
        ? "Important: High Risk Heart Health Assessment"
        : "Your Heart Health Assessment Results"

    // Create patient information section
    const patientInfo = `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin-top: 0;">Patient Information</h3>
        <p><strong>Name:</strong> ${userName || "Anonymous User"}</p>
        ${phoneNumber ? `<p><strong>Phone:</strong> ${phoneNumber}</p>` : ""}
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    `

    // Format chest pain type
    let chestPainType = "Typical angina"
    if (predictionData.cp === 1) chestPainType = "Atypical angina"
    else if (predictionData.cp === 2) chestPainType = "Non-anginal pain"
    else if (predictionData.cp === 3) chestPainType = "Asymptomatic"

    // Format resting ECG
    let restingECG = "Normal"
    if (predictionData.restecg === 1) restingECG = "ST-T wave abnormality"
    else if (predictionData.restecg === 2) restingECG = "Left ventricular hypertrophy"

    // Format ST slope
    let stSlope = "Upsloping"
    if (predictionData.slope === 1) stSlope = "Flat"
    else if (predictionData.slope === 2) stSlope = "Downsloping"

    // Format thalassemia
    let thal = "Normal"
    if (predictionData.thal === 1) thal = "Fixed defect"
    else if (predictionData.thal === 2) thal = "Reversible defect"

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: riskLevelText,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Heart Health Assessment Results</h2>
          
          ${patientInfo}
          
          <div style="background-color: ${
            predictionData.riskLevel === "High"
              ? "#f8d7da"
              : predictionData.riskLevel === "Moderate"
                ? "#fff3cd"
                : "#d1e7dd"
          }; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Risk Assessment</h3>
            <p><strong>Risk Level:</strong> ${predictionData.riskLevel}</p>
            <p><strong>Risk Score:</strong> ${predictionData.probability}%</p>
          </div>
          
          <h3>Basic Health Metrics:</h3>
          <ul>
            <li><strong>Age:</strong> ${predictionData.age} years</li>
            <li><strong>Gender:</strong> ${predictionData.sex === 1 ? "Male" : "Female"}</li>
            <li><strong>Blood Pressure:</strong> ${predictionData.trestbps} mm Hg</li>
            <li><strong>Cholesterol:</strong> ${predictionData.chol} mg/dl</li>
          </ul>
          
          <h3>Advanced Parameters:</h3>
          <ul>
            <li><strong>Chest Pain Type:</strong> ${chestPainType}</li>
            <li><strong>Fasting Blood Sugar:</strong> ${predictionData.fbs === 1 ? "> 120 mg/dl" : "≤ 120 mg/dl"}</li>
            <li><strong>Resting ECG:</strong> ${restingECG}</li>
            <li><strong>Max Heart Rate:</strong> ${predictionData.thalach}</li>
            <li><strong>Exercise Induced Angina:</strong> ${predictionData.exang === 1 ? "Yes" : "No"}</li>
            <li><strong>ST Depression:</strong> ${predictionData.oldpeak}</li>
            <li><strong>ST Slope:</strong> ${stSlope}</li>
            <li><strong>Number of Major Vessels:</strong> ${predictionData.ca}</li>
            <li><strong>Thalassemia:</strong> ${thal}</li>
          </ul>
          
          ${
            predictionData.foodHabits || predictionData.junkFood || predictionData.sleepingHours
              ? `
            <h3>Lifestyle Factors:</h3>
            <ul>
              ${predictionData.foodHabits ? `<li><strong>Food Habits:</strong> ${predictionData.foodHabits}</li>` : ""}
              ${predictionData.junkFood ? `<li><strong>Junk Food Consumption:</strong> ${predictionData.junkFood}</li>` : ""}
              <li><strong>Sleeping Hours:</strong> ${predictionData.sleepingHours || "N/A"} hours/day</li>
            </ul>
          `
              : ""
          }
          
          <p style="font-style: italic; color: #6c757d; font-size: 0.9em; margin-top: 20px;">
            This assessment is not a medical diagnosis. Please consult with a healthcare provider.
          </p>
          
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
          
          <p style="font-size: 0.8em; color: #6c757d;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
