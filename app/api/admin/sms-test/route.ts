import { type NextRequest, NextResponse } from "next/server"
import { sendTestSMS, isTwilioConfigured } from "@/lib/enhanced-sms-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Check if Twilio is configured
    const twilioConfig = await isTwilioConfigured()
    if (!twilioConfig.configured) {
      return NextResponse.json(
        {
          success: false,
          message: "Twilio is not properly configured",
          details: {
            missingEnvVars: twilioConfig.missing,
          },
        },
        { status: 500 },
      )
    }

    // Send test SMS
    const result = await sendTestSMS(phone)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error in SMS test:", error)
    await logError("smsTest", error, { phone: "test" })

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while testing SMS",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
