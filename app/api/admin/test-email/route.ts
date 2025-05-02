import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth-utils"
import { logError } from "@/lib/error-logger"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { to } = body

    if (!to) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    // Check if email configuration is available
    const requiredVars = ["EMAIL_SERVER", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASSWORD", "EMAIL_FROM"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required email configuration: ${missingVars.join(", ")}`,
        details: { missingVars },
      })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "HeartPredict Email Test",
      text: "This is a test email from HeartPredict. If you received this, email sending is working correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #e53e3e;">HeartPredict Email Test</h2>
          <p>This is a test email from HeartPredict.</p>
          <p>If you received this, email sending is working correctly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message sent from the admin panel.</p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        messageId: info.messageId,
        response: info.response,
      },
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    await logError("test-email", error)

    return NextResponse.json({
      success: false,
      message: `Failed to send test email: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    })
  }
}
