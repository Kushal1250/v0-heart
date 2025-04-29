import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth-utils"
import { sendEmail } from "@/lib/email-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    // Verify admin session
    const user = await verifyAdminSession(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, message } = body

    // Validate input
    if (!to || !subject || !message) {
      return NextResponse.json({ success: false, message: "Email, subject, and message are required" }, { status: 400 })
    }

    // Send test email
    const result = await sendEmail({
      to,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>${message}</p>
        <hr>
        <p><em>This is a test email from the Heart Health Predictor admin panel.</em></p>
      </div>`,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending test email:", error)
    await logError("admin-email-test", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? `Server error: ${error.message}` : "An unknown server error occurred",
      },
      { status: 500 },
    )
  }
}
