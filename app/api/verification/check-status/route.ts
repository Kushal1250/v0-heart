import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the verification type from query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type || (type !== "sms" && type !== "email")) {
      return NextResponse.json({ message: "Invalid verification type" }, { status: 400 })
    }

    // Check if the verification method is configured
    if (type === "sms") {
      const twilioConfigured = !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      )

      return NextResponse.json({
        configured: twilioConfigured,
        message: twilioConfigured
          ? "SMS verification is configured"
          : "SMS verification is not configured. Please add Twilio credentials to your environment variables.",
      })
    } else {
      // Email verification
      const emailConfigured = !!(
        process.env.EMAIL_SERVER &&
        process.env.EMAIL_PORT &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASSWORD
      )

      return NextResponse.json({
        configured: emailConfigured,
        message: emailConfigured
          ? "Email verification is configured"
          : "Email verification is not configured. Please add email server credentials to your environment variables.",
      })
    }
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
