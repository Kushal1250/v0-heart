import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { jsPDF } from "jspdf"

// Helper function to format assessment data as HTML
function formatAssessmentDataAsHtml(data: any, includePdfAttachment: boolean) {
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

  // Create HTML email content - simplified to avoid spam triggers
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <h2 style="color: #333333; margin-bottom: 20px;">Health Assessment Results</h2>
      
      <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #333333;">
          ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk Assessment
        </h3>
        <p>Risk Score: ${riskScore}%</p>
      </div>

      <h3 style="border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Health Information</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          ${formatMetric("Age", data.age, "years")}
          ${formatMetric("Gender", getSexText(data.sex))}
          ${formatMetric("Blood Pressure", data.trestbps, "mm Hg")}
          ${formatMetric("Cholesterol", data.chol, "mg/dl")}
          ${formatMetric("Chest Pain Type", getChestPainText(data.cp))}
          ${formatMetric("Fasting Blood Sugar > 120 mg/dl", data.fbs === "1" ? "Yes" : "No")}
          ${data.thalach ? formatMetric("Max Heart Rate", data.thalach) : ""}
          ${formatMetric("Exercise Induced Angina", data.exang === "1" ? "Yes" : "No")}
        </tbody>
      </table>

      ${
        includePdfAttachment
          ? `<p style="font-size: 12px; color: #666666; margin-top: 10px;">A PDF version of this assessment is attached to this email for your convenience.</p>`
          : ""
      }

      <p style="font-size: 12px; color: #666666; border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 20px;">
        Assessment generated on ${new Date().toLocaleDateString()}
      </p>
    </div>
  `
}

// Generate PDF buffer from assessment data
async function generatePdfBuffer(data: any): Promise<Buffer> {
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

  // Add date
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30)

  // Add risk level
  pdf.setFontSize(16)
  pdf.setTextColor(0, 0, 0)
  const riskLevel = data.result.risk.charAt(0).toUpperCase() + data.result.risk.slice(1)
  pdf.text(`Risk Level: ${riskLevel}`, 20, 45)

  // Add risk score
  pdf.setFontSize(14)
  pdf.text(`Risk Score: ${data.result.score}%`, 20, 55)

  // Add health metrics section
  pdf.setFontSize(16)
  pdf.text("Health Metrics", 20, 70)

  // Draw a line
  pdf.setDrawColor(200, 200, 200)
  pdf.line(20, 72, 190, 72)

  // Add metrics
  pdf.setFontSize(12)
  let y = 80

  // Helper function to add a metric
  const addMetric = (label: string, value: string) => {
    pdf.setTextColor(80, 80, 80)
    pdf.text(label, 20, y)
    pdf.setTextColor(0, 0, 0)
    pdf.text(value, 80, y)
    y += 10
  }

  // Add basic metrics
  addMetric("Age:", `${data.age} years`)
  addMetric("Gender:", data.sex === "1" ? "Male" : "Female")
  addMetric("Blood Pressure:", `${data.trestbps} mm Hg`)
  addMetric("Cholesterol:", `${data.chol} mg/dl`)
  addMetric(
    "Chest Pain Type:",
    (() => {
      const types = ["Typical angina", "Atypical angina", "Non-anginal pain", "Asymptomatic"]
      return types[Number.parseInt(data.cp)] || data.cp
    })(),
  )
  addMetric("Fasting Blood Sugar:", data.fbs === "1" ? "Above 120 mg/dl" : "Below 120 mg/dl")

  if (data.thalach) {
    addMetric("Max Heart Rate:", data.thalach)
  }

  addMetric("Exercise Induced Angina:", data.exang === "1" ? "Yes" : "No")

  // Add disclaimer
  y += 10
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text("This assessment is not a medical diagnosis. Please consult with a healthcare provider.", 20, y)

  // Add footer
  pdf.setFontSize(8)
  pdf.setTextColor(150, 150, 150)
  pdf.text(`Generated by HeartPredict on ${new Date().toLocaleDateString()}`, 20, pdf.internal.pageSize.height - 10)

  // Convert to buffer
  const pdfOutput = pdf.output("arraybuffer")
  return Buffer.from(pdfOutput)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, assessmentData, includePdfAttachment } = body

    // Validate email
    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 })
    }

    // Validate subject
    if (!subject || subject.trim().length === 0) {
      return NextResponse.json({ error: "Email subject is required" }, { status: 400 })
    }

    // Create email content - simplified to avoid spam triggers
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <h2 style="color: #333333;">Health Assessment</h2>
        <p>${message || "Please find my health assessment results below."}</p>
    `

    // Add assessment data if included
    if (assessmentData) {
      htmlContent += formatAssessmentDataAsHtml(assessmentData, includePdfAttachment)
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
        const pdfBuffer = await generatePdfBuffer(assessmentData)

        // Create filename based on risk level and date
        const riskLevel = assessmentData.result.risk
        const date = new Date().toISOString().split("T")[0]
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
