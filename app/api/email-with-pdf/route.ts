import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { enhancedGeneratePDF } from "@/lib/enhanced-pdf-generator"
import { createDKIMSignature } from "@/lib/email-utils"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, assessmentData, userName, userPhone, assessmentDate } = await request.json()

    // Validate inputs
    if (!to || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate PDF
    const pdfBuffer = await enhancedGeneratePDF(assessmentData, userName, assessmentDate)

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number.parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Prepare email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Heart Health Assessment Results</h2>
        <p>${message}</p>
        <p>This email contains a PDF attachment with the assessment results.</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f8f8; border-left: 4px solid #d32f2f;">
          <p style="margin: 0; font-style: italic;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `

    // Create DKIM signature if domain keys are available
    const dkimOptions = await createDKIMSignature()

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: emailContent,
      attachments: [
        {
          filename: `Heart_Health_Assessment_${new Date().toISOString().split("T")[0]}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
      ...dkimOptions, // Add DKIM signature if available
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email with PDF:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email with PDF" },
      { status: 500 },
    )
  }
}
