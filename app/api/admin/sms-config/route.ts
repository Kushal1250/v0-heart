import { NextResponse } from "next/server"
import { isTwilioConfigured } from "@/lib/enhanced-sms-utils"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const twilioConfig = await isTwilioConfigured()

    return NextResponse.json({
      success: true,
      configured: twilioConfig.configured,
      missing: twilioConfig.missing,
      details: twilioConfig.details,
      environment: process.env.NODE_ENV || "unknown",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        configured: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
