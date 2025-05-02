import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth-utils"
import { logError } from "@/lib/error-logger"
import { formatPhoneToE164, isValidPhone } from "@/lib/enhanced-sms-utils"

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    // Format and validate phone number
    const formattedPhone = await formatPhoneToE164(phone)
    const isValid = await isValidPhone(formattedPhone)

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "Invalid phone number format",
        details: { originalPhone: phone, formattedPhone },
      })
    }

    // Check if Twilio configuration is available
    const requiredVars = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing required SMS configuration: ${missingVars.join(", ")}`,
        details: { missingVars },
      })
    }

    // In development mode, just simulate sending
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV MODE] Would send SMS to ${formattedPhone}: This is a test message from HeartPredict.`)

      return NextResponse.json({
        success: true,
        message: "SMS simulated in development mode",
        details: {
          mode: "development",
          phone: formattedPhone,
        },
      })
    }

    // In production, send the actual SMS
    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    const fromNumber = process.env.TWILIO_PHONE_NUMBER!

    // Dynamically import Twilio to avoid bundling issues
    const { Twilio } = await import("twilio")
    const client = new Twilio(accountSid, authToken)

    const message = await client.messages.create({
      body: "This is a test message from HeartPredict. If you received this, SMS sending is working correctly!",
      from: fromNumber,
      to: formattedPhone,
    })

    return NextResponse.json({
      success: true,
      message: "Test SMS sent successfully",
      details: {
        sid: message.sid,
        status: message.status,
      },
    })
  } catch (error) {
    console.error("Error sending test SMS:", error)
    await logError("test-sms", error)

    return NextResponse.json({
      success: false,
      message: `Failed to send test SMS: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    })
  }
}
