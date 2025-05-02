import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth-utils"
import { getNotificationServicesStatus, activateService } from "@/lib/notification-service-checker"
import { logError } from "@/lib/error-logger"

export async function GET(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = await getNotificationServicesStatus()

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking notification services:", error)
    await logError("notification-services-check", error)

    return NextResponse.json({ error: "Failed to check notification services" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { service } = body

    if (!service || !["email_service", "sms_service"].includes(service)) {
      return NextResponse.json({ error: "Invalid service specified" }, { status: 400 })
    }

    const success = await activateService(service)

    if (success) {
      return NextResponse.json({
        success: true,
        message: `${service === "email_service" ? "Email" : "SMS"} service activated successfully`,
      })
    } else {
      return NextResponse.json({ error: "Failed to activate service" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error activating notification service:", error)
    await logError("notification-service-activation", error)

    return NextResponse.json({ error: "Failed to activate notification service" }, { status: 500 })
  }
}
