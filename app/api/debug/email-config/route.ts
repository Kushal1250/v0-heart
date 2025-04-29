import { NextResponse } from "next/server"
import { verifyEmailConfig } from "@/lib/email-utils"
import { verifyAdminSession } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Verify admin session
    const user = await verifyAdminSession(request)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all email-related environment variables
    const emailConfig = {
      EMAIL_SERVER: process.env.EMAIL_SERVER || "(not set)",
      EMAIL_PORT: process.env.EMAIL_PORT || "(not set)",
      EMAIL_USER: process.env.EMAIL_USER || "(not set)",
      EMAIL_FROM: process.env.EMAIL_FROM || "(not set)",
      EMAIL_SECURE: process.env.EMAIL_SECURE || "(not set)",
      // Not showing actual password for security reasons
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "(set)" : "(not set)",
    }

    // Verify email configuration
    const verification = await verifyEmailConfig()

    return NextResponse.json({
      config: emailConfig,
      verification,
    })
  } catch (error) {
    console.error("Error checking email configuration:", error)
    return NextResponse.json(
      {
        message: "An error occurred while checking email configuration",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
