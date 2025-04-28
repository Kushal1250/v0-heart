import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { generateEnhancedPDF } from "@/lib/enhanced-pdf-generator"

export async function POST(request: NextRequest) {
  try {
    const { email, predictionData, userName, phoneNumber } = await request.json()

    if (!email || !predictionData) {
      return NextResponse.json({ error: "Email and prediction data are required" }, { status: 400 })
    }

    // Generate PDF
    const pdfBuffer = await generateEnhancedPDF(predictionData, userName || "Anonymous User", phoneNumber || "")

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

    // Create email content with patient information
    const patientInfo = `
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin-top: 0;">Patient Information</h3>
        <p><strong>Name:</strong> ${userName || "Anonymous User"}</p>
        ${phoneNumber ? `<p><strong>Phone:</strong> ${phoneNumber}</p>` : ""}
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>
    `

    // Send email with PDF attachment
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: riskLevelText,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Heart Health Assessment Results</h2>
          
          ${patientInfo}
          
          <p>Thank you for using our Heart Disease Prediction service. Your assessment results are attached as a PDF.</p>
          
          <div style="background-color: ${
            predictionData.riskLevel === "High"
              ? "#f8d7da"
              : predictionData.riskLevel === "Moderate"
                ? "#fff3cd"
                : "#d1e7dd"
          }; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Risk Assessment Summary</h3>
            <p><strong>Risk Level:</strong> ${predictionData.riskLevel}</p>
            <p><strong>Risk Score:</strong> ${predictionData.probability}%</p>
          </div>
          
          <p style="font-style: italic; color: #6c757d; font-size: 0.9em;">
            This assessment is not a medical diagnosis. Please consult with a healthcare provider.
          </p>
          
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
          
          <p style="font-size: 0.8em; color: #6c757d;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: "heart-health-assessment.pdf",
          content: pdfBuffer,
        },
      ],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email with PDF:", error)
    return NextResponse.json({ error: "Failed to send email with PDF" }, { status: 500 })
  }
}
