import { NextResponse } from "next/server"
import { sendTestSMS } from "@/lib/sms-utils"
import { verifyAdminSession } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    // Send test SMS
    const result = await sendTestSMS(phone)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      sid: result.sid,
      errorDetails: result.errorDetails,
      debugInfo: result.debugInfo,
    })
  } catch (error) {
    console.error("Error sending test SMS:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while sending test SMS",
      },
      { status: 500 },
    )
  }
}
