import { NextResponse } from "next/server"
import { sendTestSMS } from "@/lib/enhanced-sms-utils"
import { getUserFromRequest } from "@/lib/auth-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 })
    }

    console.log(`Admin SMS test to ${phone}`)
    const result = await sendTestSMS(phone)

    return NextResponse.json(result)
  } catch (error) {
    console.error("SMS test error:", error)
    await logError("smsTest", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
