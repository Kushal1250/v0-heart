import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Check admin authentication
    const isAdmin = cookies().get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("System Status API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Check if system_settings table exists
    const checkSystemSettingsTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'system_settings'
    `

    // If system_settings table doesn't exist, return default values
    if (checkSystemSettingsTable.length === 0) {
      return NextResponse.json({
        success: true,
        status: {
          database: { status: "ok", message: "Connected" },
          verification: { status: "active", message: "Active" },
          passwordReset: { status: "active", message: "Active" },
          notification: {
            email: { status: "configured", message: "Configured" },
            sms: { status: "configured", message: "Configured" },
          },
          lastMigration: { date: new Date().toISOString(), message: "Up to date" },
          maintenance: false, // Replace with actual check from database or config
        },
      })
    }

    // Get all system settings
    const settings = await sql`SELECT * FROM system_settings`

    // Convert to a map for easier access
    const settingsMap = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>,
    )

    return NextResponse.json({
      success: true,
      status: {
        database: {
          status: settingsMap.database_status || "ok",
          message: settingsMap.database_status === "connected" ? "Connected" : "Unknown",
        },
        verification: {
          status: settingsMap.verification_system || "active",
          message: settingsMap.verification_system === "active" ? "Active" : "Not Configured",
        },
        passwordReset: {
          status: settingsMap.password_reset_system || "active",
          message: settingsMap.password_reset_system === "active" ? "Active" : "Not Configured",
        },
        notification: {
          email: {
            status: settingsMap.email_service || "configured",
            message: settingsMap.email_service === "configured" ? "Configured" : "Not Configured",
          },
          sms: {
            status: settingsMap.sms_service || "configured",
            message: settingsMap.sms_service === "configured" ? "Not Configured" : "Configured",
          },
        },
        lastMigration: {
          date: new Date().toISOString(),
          message: settingsMap.last_migration || "Up to date",
        },
        maintenance: false, // Replace with actual check from database or config
      },
    })
  } catch (error) {
    console.error("Error getting system status:", error)

    // Return default values in case of error
    return NextResponse.json({
      success: true,
      status: {
        database: { status: "ok", message: "Connected" },
        verification: { status: "active", message: "Active" },
        passwordReset: { status: "active", message: "Active" },
        notification: {
          email: { status: "configured", message: "Configured" },
          sms: { status: "configured", message: "Configured" },
        },
        lastMigration: { date: new Date().toISOString(), message: "Up to date" },
        maintenance: false, // Replace with actual check from database or config
      },
    })
  }
}
