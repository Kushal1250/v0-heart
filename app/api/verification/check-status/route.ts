import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { createErrorResponse } from "@/lib/error-logger"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check SMS configuration
    const smsConfigured = Boolean(
      process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER,
    )

    // Check email configuration
    const emailConfigured = Boolean(
      process.env.EMAIL_SERVER && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD,
    )

    // Prepare detailed status information
    const status = {
      sms: {
        configured: smsConfigured,
        message: smsConfigured
          ? "SMS verification is configured correctly"
          : "SMS verification is not configured. Please add Twilio credentials to your environment variables.",
        details: {
          accountSid: Boolean(process.env.TWILIO_ACCOUNT_SID) ? "Configured" : "Missing",
          authToken: Boolean(process.env.TWILIO_AUTH_TOKEN) ? "Configured" : "Missing",
          phoneNumber: Boolean(process.env.TWILIO_PHONE_NUMBER) ? "Configured" : "Missing",
        },
      },
      email: {
        configured: emailConfigured,
        message: emailConfigured
          ? "Email verification is configured correctly"
          : "Email verification is not configured. Please add email server credentials to your environment variables.",
        details: {
          server: Boolean(process.env.EMAIL_SERVER) ? "Configured" : "Missing",
          port: Boolean(process.env.EMAIL_PORT) ? "Configured" : "Missing",
          user: Boolean(process.env.EMAIL_USER) ? "Configured" : "Missing",
          password: Boolean(process.env.EMAIL_PASSWORD) ? "Configured" : "Missing",
        },
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    const errorResponse = await createErrorResponse("verification/check-status", error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
