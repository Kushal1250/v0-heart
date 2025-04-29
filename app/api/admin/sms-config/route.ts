import { NextResponse } from "next/server"
import { isTwilioConfigured } from "@/lib/sms-utils"
import { verifyAdminSession } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check Twilio configuration
    const twilioConfig = await isTwilioConfigured()

    return NextResponse.json({
      configured: twilioConfig.configured,
      missing: twilioConfig.missing,
      details: twilioConfig.details,
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("Error checking SMS configuration:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while checking SMS configuration",
      },
      { status: 500 },
    )
  }
}
