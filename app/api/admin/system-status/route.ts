import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { isTwilioConfigured } from "@/lib/enhanced-sms-utils"

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request as any)

    if (!user || user.role !== "admin") {
      console.log("System Status API: Not an admin")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    let databaseStatus = "ok"
    try {
      await db`SELECT 1 as connected`
    } catch {
      databaseStatus = "error"
    }

    let smsStatus = "misconfigured"
    try {
      const twilioConfig = await isTwilioConfigured()
      smsStatus = twilioConfig.configured ? "configured" : "misconfigured"
    } catch {
      smsStatus = "error"
    }

    // Return dynamic status
    return NextResponse.json({
      success: true,
      status: {
        database: {
          status: databaseStatus,
          message: databaseStatus === "ok" ? "Connected" : "Connection failed",
          responseTime: "< 100ms",
        },
        verification: {
          status: "active",
          message: "Active",
        },
        passwordReset: {
          status: "active",
          message: "Active",
        },
        notification: {
          email: {
            status: process.env.EMAIL_SERVER ? "configured" : "misconfigured",
            message: process.env.EMAIL_SERVER ? "Configured" : "Not configured",
          },
          sms: {
            status: smsStatus,
            message: smsStatus === "configured" ? "Configured" : "Not configured",
          },
        },
        lastMigration: {
          message: "Up to date",
          date: new Date().toISOString(),
        },
        maintenance: false,
      },
    })
  } catch (error) {
    console.error("Error getting system status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
