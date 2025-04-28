import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { jsPDF } from "jspdf"

// Helper function to format assessment data as HTML
function formatAssessmentDataAsHtml(
  data: any,
  includePdfAttachment: boolean,
  userName?: string,
  userPhone?: string,
  assessmentDate: Date = new Date(),
) {
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

  // Get risk level
  const riskLevel = data.result.risk
  const riskScore = data.result.score

  // Format health metrics
  const formatMetric = (name: string, value: string, unit = "") => {
    return `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${value}${unit ? ` ${unit}` : ""}</td>
    </tr>`
  }

  // Map sex values to readable text
  const getSexText = (value: string) => (value === "1" ? "Male" : "Female")

  // Map chest pain types
  const getChestPainText = (value: string) => {
    const types = ["Typical angina", "Atypical angina", "Non-anginal pain", "Asymptomatic"]
    return types[Number.parseInt(value)] || value
  }

  // Map resting ECG values
  const getRestEcgText = (value: string) => {
    const types = ["Normal", "ST-T wave abnormality", "Left ventricular hypertrophy"]
    return types[Number.parseInt(value)] || value
  }

  // Map slope values
  const getSlopeText = (value: string) => {
    const types = ["Upsloping", "Flat", "Downsloping"]
    return types[Number.parseInt(value)] || value
  }

  // Map thal values
  const getThalText = (value: string) => {
    const types = ["Normal", "Fixed defect", "Reversible defect"]
    return types[Number.parseInt(value)] || value
  }

  // Create HTML email content - simplified to avoid spam triggers
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <h2 style="color: #333333; margin-bottom: 20px;">Health Assessment Results</h2>
      
      <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin-top: 0; margin-bottom: 5px;"><strong>Patient:</strong> ${userName || "Anonymous User"}</p>
        ${userPhone ? `<p style="margin-top: 0; margin-bottom: 5px;"><strong>Phone:</strong> ${userPhone}</p>` : ""}
        <p style="margin-top: 0; margin-bottom: 15px;"><strong>Date & Time:</strong> ${formattedDate} at ${formattedTime}</p>
        <h3 style="margin-top: 0; color: #333333;">
          ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk Assessment
        </h3>
        <p>Risk Score: ${riskScore}%</p>
      </div>

      <h3 style="border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Basic Health Information</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          ${formatMetric("Age", data.age, "years")}
          ${formatMetric("Gender", getSexText(data.sex))}
          ${formatMetric("Blood Pressure", data.trestbps, "mm Hg")}
          ${formatMetric("Cholesterol", data.chol, "mg/dl")}
        </tbody>
      </table>
      
      <h3 style="border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Cardiac Assessment</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          ${formatMetric("Chest Pain Type", getChestPainText(data.cp))}
          ${formatMetric("Fasting Blood Sugar > 120 mg/dl", data.fbs === "1" ? "Yes" : "No")}
          ${data.restecg ? formatMetric("Resting ECG", getRestEcgText(data.restecg)) : ""}
          ${data.thalach ? formatMetric("Max Heart Rate", data.thalach) : ""}
          ${formatMetric("Exercise Induced Angina", data.exang === "1" ? "Yes" : "No")}
          ${data.oldpeak ? formatMetric("ST Depression", data.oldpeak) : ""}
          ${data.slope ? formatMetric("ST Slope", getSlopeText(data.slope)) : ""}
          ${data.ca ? formatMetric("Number of Major Vessels", data.ca) : ""}
          ${data.thal ? formatMetric("Thalassemia", getThalText(data.thal)) : ""}
        </tbody>
      </table>
      
      <h3 style="border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Lifestyle Factors</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          ${
            data.foodHabits
              ? formatMetric(
                  "Food Habits",
                  data.foodHabits === "vegetarian"
                    ? "Vegetarian"
                    : data.foodHabits === "non-vegetarian"
                      ? "Non-Vegetarian"
                      : "Mixed Diet",
                )
              : ""
          }
          ${
            data.junkFoodConsumption
              ? formatMetric(
                  "Junk Food Consumption",
                  data.junkFoodConsumption === "low"
                    ? "Low (rarely)"
                    : data.junkFoodConsumption === "moderate"
                      ? "Moderate (weekly)"
                      : "High (daily)",
                )
              : ""
          }
          ${data.sleepingHours ? formatMetric("Sleeping Hours", data.sleepingHours, "hours/day") : ""}
        </tbody>
      </table>

      ${
        includePdfAttachment
          ? `<p style="font-size: 12px; color: #666666; margin-top: 10px;">A PDF version of this assessment is attached to this email for your convenience.</p>`
          : ""
      }

      <p style="font-size: 12px; color: #666666; border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 20px;">
        Assessment generated on ${formattedDate} at ${formattedTime}
      </p>
    </div>
  `
}

// Generate PDF buffer from assessment data
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

  // Add patient name if available
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

  // Add disclaimer
  yOffset += 10
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
    const { to, subject, message, assessmentData, includePdfAttachment, userName, userPhone, assessmentDate } = body

    // Validate email
    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 })
    }

    // Validate subject
    if (!subject || subject.trim().length === 0) {
      return NextResponse.json({ error: "Email subject is required" }, { status: 400 })
    }

    // Parse assessment date if provided
    const parsedDate = assessmentDate ? new Date(assessmentDate) : new Date()

    // Create email content - simplified to avoid spam triggers
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <h2 style="color: #333333;">Health Assessment</h2>
        <p>${message || "Please find my health assessment results below."}</p>
    `

    // Add assessment data if included
    if (assessmentData) {
      htmlContent += formatAssessmentDataAsHtml(assessmentData, includePdfAttachment, userName, userPhone, parsedDate)
    } else {
      htmlContent += `
        <p style="margin-top: 20px;">
          <strong>Note:</strong> The sender chose to share only this message without including detailed health metrics.
        </p>
      `
    }

    // Close the HTML content
    htmlContent += `
        <p style="font-size: 12px; color: #666666; border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 20px;">
          This email was sent via HeartPredict.
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

Risk Level: ${assessmentData ? assessmentData.result.risk.toUpperCase() : "N/A"}
Risk Score: ${assessmentData ? assessmentData.result.score + "%" : "N/A"}

This email was sent via HeartPredict.
    `

    // Log environment variables (without exposing passwords)
    console.log("Email configuration:", {
      server: process.env.EMAIL_SERVER || "(not set)",
      port: process.env.EMAIL_PORT || "(not set)",
      secure: process.env.EMAIL_SECURE || "(not set)",
      user: process.env.EMAIL_USER ? "✓ Set" : "✗ Not set",
      from: process.env.EMAIL_FROM || "(not set)",
    })

    // Create a test transporter to verify credentials
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

    // Generate PDF if requested and assessment data is provided
    const attachments = []
    if (includePdfAttachment && assessmentData) {
      try {
        // Generate PDF buffer
        const pdfBuffer = await generatePdfBuffer(assessmentData, userName, userPhone, parsedDate)

        // Create filename based on risk level and date
        const riskLevel = assessmentData.result.risk
        const date = parsedDate.toISOString().split("T")[0]
        const filename = `health-assessment-${riskLevel}-risk-${date}.pdf`

        // Add attachment
        attachments.push({
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        })

        console.log("PDF attachment created successfully")
      } catch (pdfError) {
        console.error("Error generating PDF attachment:", pdfError)
        // Continue without PDF if generation fails
      }
    }

    // Send email with improved configuration
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text: textContent, // Plain text version
      html: htmlContent,
      attachments,
    }

    try {
      // Verify connection configuration
      await transporter.verify()
      console.log("SMTP connection verified successfully")

      // Send the email
      const info = await transporter.sendMail(mailOptions)
      console.log("Email sent successfully:", info.messageId)

      return NextResponse.json({ success: true, messageId: info.messageId })
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
