import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { testConnection } from "@/lib/db"
import { checkEmailConfiguration, checkSmsConfiguration } from "@/lib/notification-service-checker"

export async function GET(request: Request) {
  try {
    // Check admin authentication
    const isAdmin = cookies().get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("System Status API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Test database connection
    const dbStatus = await testConnection()

    // Check email and SMS configuration
    const emailStatus = await checkEmailConfiguration()
    const smsStatus = await checkSmsConfiguration()

    // Get last migration info
    let lastMigration = { message: "Unknown", date: null }
    if (dbStatus.success) {
      // If we have a successful connection, we could query for migration info
      // This is simplified - in a real app you might have a migrations table
      lastMigration = {
        message: "Connected, migration status unknown",
        date: new Date().toISOString(),
      }
    }

    return NextResponse.json({
      success: true,
      status: {
        database: {
          status: dbStatus.success ? "ok" : "error",
          message: dbStatus.success ? "Connected" : "Connection failed",
          responseTime: dbStatus.success ? "< 100ms" : "N/A",
          error: dbStatus.success ? undefined : dbStatus.error,
        },
        authentication: {
          verification: {
            status: "active",
            message: "Active",
          },
          passwordReset: {
            status: "active",
            message: "Active",
          },
        },
        notification: {
          email: {
            status: emailStatus.configured ? "configured" : "not_configured",
            message: emailStatus.message,
            details: emailStatus.details,
          },
          sms: {
            status: smsStatus.configured ? "configured" : "not_configured",
            message: smsStatus.message,
            details: smsStatus.details,
          },
        },
        lastMigration: lastMigration,
        maintenance: false,
      },
    })
  } catch (error) {
    console.error("Error getting system status:", error)

    return NextResponse.json(
      {
        success: false,
        error: String(error),
        status: {
          database: { status: "error", message: "Error checking status" },
          authentication: {
            verification: { status: "unknown", message: "Unknown" },
            passwordReset: { status: "unknown", message: "Unknown" },
          },
          notification: {
            email: { status: "unknown", message: "Unknown" },
            sms: { status: "unknown", message: "Unknown" },
          },
          lastMigration: { message: "Unknown", date: null },
          maintenance: false,
        },
      },
      { status: 500 },
    )
  }
}
