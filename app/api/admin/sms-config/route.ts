import { type NextRequest, NextResponse } from "next/server"
import { isTwilioConfigured } from "@/lib/enhanced-sms-utils"

export async function GET(request: NextRequest) {
  try {
    const twilioConfig = await isTwilioConfigured()

    return NextResponse.json({
      configured: twilioConfig.configured,
      missing: twilioConfig.missing,
      environment: process.env.NODE_ENV || "unknown",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
