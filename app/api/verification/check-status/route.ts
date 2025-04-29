import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check SMS configuration
    const smsConfigured = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    )

    // Check email configuration
    const emailConfigured = !!(
      process.env.EMAIL_SERVER &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD
    )

    return NextResponse.json({
      sms: {
        configured: smsConfigured,
        message: smsConfigured ? "Twilio is properly configured" : "Twilio credentials are missing or incomplete",
      },
      email: {
        configured: emailConfigured,
        message: emailConfigured
          ? "Email service is properly configured"
          : "Email configuration is missing or incomplete",
      },
    })
  } catch (error) {
    console.error("Error checking verification status:", error)
    return NextResponse.json(
      {
        message: `Failed to check verification status: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
