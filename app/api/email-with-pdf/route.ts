import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { jsPDF } from "jspdf"

// Helper function to generate PDF buffer from assessment data
async function generatePdfBuffer(
  data: any,
  userName?: string,
  userPhone?: string,
  assessmentDate: Date = new Date(),
): Promise<Buffer> {
  // Format date and time for display
  const formattedDate = assessmentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = assessmentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Create PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
  })

  // Set font
  pdf.setFont("helvetica")

  // Add title
  pdf.setFontSize(20)
  pdf.setTextColor(0, 0, 0)
  pdf.text("Health Assessment Results", 20, 20)

  // Add patient name if available - Fix: Use the actual userName instead of hardcoded "Patient"
  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`Patient: ${userName || "Anonymous User"}`, 20, 30)

  // Add patient phone if available
  let yOffset = 35
  if (userPhone) {
    pdf.text(`Phone: ${userPhone}`, 20, yOffset)
    yOffset += 5
  }

  // Add date and time
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Generated on ${formattedDate} at ${formattedTime}`, 20, yOffset)
  yOffset += 10

  // Add risk level
  pdf.setFontSize(16)
  pdf.setTextColor(0, 0, 0)
  const riskLevel = data.result.risk.charAt(0).toUpperCase() + data.result.risk.slice(1)
  pdf.text(`Risk Level: ${riskLevel}`, 20, yOffset)
  yOffset += 10

  // Add risk score
  pdf.setFontSize(14)
  pdf.text(`Risk Score: ${data.result.score}%`, 20, yOffset)
  yOffset += 10

  // Helper function to get human-readable values
  const getReadableValue = (field: string, value: string): string => {
    const mappings: Record<string, Record<string, string>> = {
      sex: { "0": "Female", "1": "Male" },
      cp: { "0": "Typical angina", "1": "Atypical angina", "2": "Non-anginal pain", "3": "Asymptomatic" },
      fbs: { "0": "≤ 120 mg/dl", "1": "> 120 mg/dl" },
      restecg: { "0": "Normal", "1": "ST-T wave abnormality", "2": "Left ventricular hypertrophy" },
      exang: { "0": "No", "1": "Yes" },
      slope: { "0": "Upsloping", "1": "Flat", "2": "Downsloping" },
      thal: { "0": "Normal", "1": "Fixed defect", "2": "Reversible defect" },
    }

    if (field in mappings && value in mappings[field]) {
      return mappings[field][value]
    }

    return value
  }

  // Add basic health metrics
  pdf.setFontSize(16)
  pdf.text("Basic Health Metrics:", 20, yOffset)
  yOffset += 8

  pdf.setFontSize(12)
  pdf.text(`Age: ${data.age} years`, 25, yOffset)
  yOffset += 6
  pdf.text(`Gender: ${getReadableValue("sex", data.sex)}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Blood Pressure: ${data.trestbps} mm Hg`, 25, yOffset)
  yOffset += 6
  pdf.text(`Cholesterol: ${data.chol} mg/dl`, 25, yOffset)
  yOffset += 10

  // Add advanced parameters
  pdf.setFontSize(16)
  pdf.text("Advanced Parameters:", 20, yOffset)
  yOffset += 8

  pdf.setFontSize(12)
  pdf.text(`Chest Pain Type: ${getReadableValue("cp", data.cp)}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Fasting Blood Sugar: ${getReadableValue("fbs", data.fbs)}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Resting ECG: ${getReadableValue("restecg", data.restecg)}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Max Heart Rate: ${data.thalach || "N/A"}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Exercise Induced Angina: ${getReadableValue("exang", data.exang)}`, 25, yOffset)
  yOffset += 6
  pdf.text(`ST Depression: ${data.oldpeak || "N/A"}`, 25, yOffset)
  yOffset += 6
  pdf.text(`ST Slope: ${getReadableValue("slope", data.slope) || "N/A"}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Number of Major Vessels: ${data.ca || "N/A"}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Thalassemia: ${getReadableValue("thal", data.thal) || "N/A"}`, 25, yOffset)
  yOffset += 10

  // Add lifestyle factors
  pdf.setFontSize(16)
  pdf.text("Lifestyle Factors:", 20, yOffset)
  yOffset += 8

  pdf.setFontSize(12)
  // Format food habits
  const foodHabits =
    data.foodHabits === "vegetarian"
      ? "Vegetarian"
      : data.foodHabits === "non-vegetarian"
        ? "Non-Vegetarian"
        : "Mixed Diet"

  // Format junk food consumption
  const junkFood =
    data.junkFoodConsumption === "low"
      ? "Low (rarely)"
      : data.junkFoodConsumption === "moderate"
        ? "Moderate (weekly)"
        : "High (daily)"

  pdf.text(`Food Habits: ${foodHabits}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Junk Food Consumption: ${junkFood}`, 25, yOffset)
  yOffset += 6
  pdf.text(`Sleeping Hours: ${data.sleepingHours || "N/A"} hours/day`, 25, yOffset)
  yOffset += 10

  // Add disclaimer
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text("This assessment is not a medical diagnosis. Please consult with a healthcare provider.", 20, yOffset)

  // Add footer
  pdf.setFontSize(8)
  pdf.setTextColor(150, 150, 150)
  pdf.text(`Generated by HeartPredict on ${formattedDate} at ${formattedTime}`, 20, pdf.internal.pageSize.height - 10)

  // Convert to buffer
  const pdfOutput = pdf.output("arraybuffer")
  return Buffer.from(pdfOutput)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, assessmentData, userName, userPhone, assessmentDate } = body

    // Validate email
    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 })
    }

    // Validate subject
    if (!subject || subject.trim().length === 0) {
      return NextResponse.json({ error: "Email subject is required" }, { status: 400 })
    }

    // Validate assessment data
    if (!assessmentData) {
      return NextResponse.json({ error: "Email and prediction data are required" }, { status: 400 })
    }

    // Parse assessment date if provided
    const parsedDate = assessmentDate ? new Date(assessmentDate) : new Date()

    // Create email content - simplified to avoid spam triggers
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <h2 style="color: #333333;">Health Assessment</h2>
        <p>${message || "Please find my health assessment results below."}</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <p style="margin-top: 0; margin-bottom: 5px;"><strong>Patient:</strong> ${userName || "Anonymous User"}</p>
          ${userPhone ? `<p style="margin-top: 0; margin-bottom: 5px;"><strong>Phone:</strong> ${userPhone}</p>` : ""}
          <p style="margin-top: 0; margin-bottom: 15px;"><strong>Date & Time:</strong> ${parsedDate.toLocaleDateString()} at ${parsedDate.toLocaleTimeString()}</p>
          <h3 style="margin-top: 0; color: #333333;">
            ${assessmentData.result.risk.charAt(0).toUpperCase() + assessmentData.result.risk.slice(1)} Risk Assessment
          </h3>
          <p>Risk Score: ${assessmentData.result.score}%</p>
        </div>
        
        <p style="font-size: 12px; color: #666666; border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 20px;">
          A PDF version of this assessment is attached to this email for your convenience.
        </p>
      </div>
    `

    // Create plain text version for better deliverability
    const textContent = `
Health Assessment

${message || "Please find my health assessment results below."}

Patient: ${userName || "Anonymous User"}
${userPhone ? `Phone: ${userPhone}` : ""}
Date: ${parsedDate.toLocaleDateString()}
Time: ${parsedDate.toLocaleTimeString()}

Risk Level: ${assessmentData.result.risk.toUpperCase()}
Risk Score: ${assessmentData.result.score}%

A PDF version of this assessment is attached to this email for your convenience.
    `

    // Create a transporter to verify credentials
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true,
      logger: true,
    })

    try {
      // Verify connection configuration
      await transporter.verify()
      console.log("SMTP connection verified successfully")

      // Generate PDF
      const pdfBuffer = await generatePdfBuffer(assessmentData, userName, userPhone, parsedDate)

      // Create filename based on risk level and date
      const riskLevel = assessmentData.result.risk
      const date = parsedDate.toISOString().split("T")[0]
      const filename = `health-assessment-${riskLevel}-risk-${date}.pdf`

      // Send email with improved configuration
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text: textContent, // Plain text version
        html: htmlContent,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      }

      // Send the email
      const info = await transporter.sendMail(mailOptions)
      console.log("Email sent successfully:", info.messageId)

      return NextResponse.json({
        success: true,
        messageId: info.messageId,
      })
    } catch (emailError: any) {
      console.error("SMTP Error:", emailError)

      // Return detailed error for debugging
      return NextResponse.json(
        {
          error: "Email sending failed",
          details: emailError.message,
          code: emailError.code || "unknown",
          command: emailError.command || "unknown",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("General error:", error)
    return NextResponse.json({ error: "Failed to process request", details: error.message }, { status: 500 })
  }
}
