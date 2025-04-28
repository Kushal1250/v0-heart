import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { generatePdfBuffer } from "@/lib/pdf-generator"

// Helper function to format assessment data as HTML (reusing existing code)
function formatAssessmentDataAsHtml(data: any) {
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

  // Create HTML email content - extremely simplified to avoid spam triggers
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

      <p style="font-size: 12px; color: #666666; border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 20px;">
        Assessment generated on ${new Date().toLocaleDateString()}
      </p>
      <p style="font-size: 12px; color: #666666;">
        A PDF version of this assessment is attached for your convenience.
      </p>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, assessmentData } = body

    // Validate email
    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 })
    }

    // Validate subject
    if (!subject || subject.trim().length === 0) {
      return NextResponse.json({ error: "Email subject is required" }, { status: 400 })
    }

    // Create email content - extremely simplified to avoid spam triggers
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <h2 style="color: #333333;">Health Assessment</h2>
        <p>${message || "Please find my health assessment results below."}</p>
    `

    // Add assessment data if included
    if (assessmentData) {
      htmlContent += formatAssessmentDataAsHtml(assessmentData)
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
          This email was sent via HeartPredict. A PDF version of this assessment is attached for your convenience.
        </p>
      </div>
    `

    // Create plain text version for better deliverability
    const textContent = `
Health Assessment

${message || "Please find my health assessment results below."}

Risk Level: ${assessmentData ? assessmentData.result.risk.toUpperCase() : "N/A"}
Risk Score: ${assessmentData ? assessmentData.result.score + "%" : "N/A"}

This email was sent via HeartPredict. A PDF version of this assessment is attached for your convenience.
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

      // Generate PDF if assessment data is provided
      const attachments = []
      if (assessmentData) {
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

      // Send the email
      const info = await transporter.sendMail(mailOptions)
      console.log("Email sent successfully:", info.messageId)

      return NextResponse.json({
        success: true,
        messageId: info.messageId,
        attachmentIncluded: attachments.length > 0,
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
