import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { sendSMS, isValidPhone } from "@/lib/sms-utils"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 })
    }

    // Generate a test code
    const testCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Send the SMS
    const result = await sendSMS(
      phone,
      `[TEST] Your HeartPredict verification code is: ${testCode}. This is a test message.`,
    )

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `Test SMS sent successfully to ${phone}`,
      code: testCode,
    })
  } catch (error) {
    console.error("Error sending test SMS:", error)
    return NextResponse.json(
      {
        message: `Failed to send test SMS: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
