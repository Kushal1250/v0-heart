import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if email service is configured
    const emailConfigured = !!(process.env.EMAIL_SERVER && process.env.EMAIL_FROM)

    // Check if SMS service is configured
    const smsConfigured = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    )

    return NextResponse.json({
      success: true,
      email: {
        status: emailConfigured ? "configured" : "not_configured",
        server: !!process.env.EMAIL_SERVER,
        from: !!process.env.EMAIL_FROM,
      },
      sms: {
        status: smsConfigured ? "configured" : "not_configured",
        accountSid: !!process.env.TWILIO_ACCOUNT_SID,
        authToken: !!process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
      },
    })
  } catch (error) {
    console.error("Error checking notification services:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
