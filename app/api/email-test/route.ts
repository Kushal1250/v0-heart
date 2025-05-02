import { type NextRequest, NextResponse } from "next/server"
import { verifyEmailConfiguration, sendTestEmail } from "@/lib/enhanced-email-utils"
import { systemLogger } from "@/lib/system-logger"

export async function GET(request: NextRequest) {
  try {
    // Verify email configuration
    const result = await verifyEmailConfiguration()

    return NextResponse.json({
      status: result.success ? "success" : "error",
      message: result.message,
      config: result.config,
    })
  } catch (error) {
    systemLogger.error("Email Test API", "Error checking email configuration", { error })
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to } = body

    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid recipient email is required",
        },
        { status: 400 },
      )
    }

    // Send test email
    const result = await sendTestEmail(to)

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Test email sent successfully" : `Failed to send test email: ${result.error}`,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
    })
  } catch (error) {
    systemLogger.error("Email Test API", "Error sending test email", { error })
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
