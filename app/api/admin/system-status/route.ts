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

    // Check database connection
    let databaseStatus = "ok"
    let databaseMessage = "Connected"

    try {
      await sql`SELECT 1`
    } catch (error) {
      databaseStatus = "error"
      databaseMessage = "Disconnected"
      console.error("Database connection error:", error)
    }

    // Check if system_settings table exists
    let systemSettingsExist = false
    try {
      const checkSystemSettingsTable = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'system_settings'
      `
      systemSettingsExist = checkSystemSettingsTable.length > 0
    } catch (error) {
      console.error("Error checking system_settings table:", error)
    }

    // Get settings from database if table exists
    let settings: Record<string, string> = {}

    if (systemSettingsExist) {
      try {
        const dbSettings = await sql`SELECT * FROM system_settings`
        settings = dbSettings.reduce(
          (acc, setting) => {
            acc[setting.key] = setting.value
            return acc
          },
          {} as Record<string, string>,
        )
      } catch (error) {
        console.error("Error fetching system settings:", error)
      }
    }

    // Check verification system
    let verificationStatus = "active"
    try {
      const verificationTable = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'verification_codes'
        ) as exists
      `
      if (!verificationTable[0]?.exists) {
        verificationStatus = "not_configured"
      }
    } catch (error) {
      verificationStatus = "error"
      console.error("Error checking verification system:", error)
    }

    // Check password reset system
    let passwordResetStatus = "active"
    try {
      const resetTable = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'password_reset_tokens'
        ) as exists
      `
      if (!resetTable[0]?.exists) {
        passwordResetStatus = "not_configured"
      }
    } catch (error) {
      passwordResetStatus = "error"
      console.error("Error checking password reset system:", error)
    }

    // Check email configuration
    const emailConfigured = !!(process.env.EMAIL_SERVER && process.env.EMAIL_FROM)

    // Check SMS configuration
    const smsConfigured = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    )

    // Get last migration info
    let lastMigration = "Up to date"
    try {
      const migrationInfo = settings.last_migration || "Up to date"
      lastMigration = migrationInfo
    } catch (error) {
      console.error("Error getting last migration:", error)
    }

    return NextResponse.json({
      success: true,
      status: {
        database: {
          status: databaseStatus,
          message: databaseMessage,
          responseTime: "< 100ms",
        },
        verification: {
          status: verificationStatus,
          message: verificationStatus === "active" ? "Active" : "Not Configured",
        },
        passwordReset: {
          status: passwordResetStatus,
          message: passwordResetStatus === "active" ? "Active" : "Not Configured",
        },
        notification: {
          email: {
            status: emailConfigured ? "configured" : "not_configured",
            message: emailConfigured ? "Configured" : "Not Configured",
          },
          sms: {
            status: smsConfigured ? "configured" : "not_configured",
            message: smsConfigured ? "Configured" : "Not Configured",
          },
        },
        lastMigration: {
          message: lastMigration,
          date: new Date().toISOString(),
        },
        maintenance: false,
      },
    })
  } catch (error) {
    console.error("Error getting system status:", error)

    // Return default values in case of error
    return NextResponse.json({
      success: true,
      status: {
        database: { status: "error", message: "Error checking connection" },
        verification: { status: "unknown", message: "Unknown" },
        passwordReset: { status: "unknown", message: "Unknown" },
        notification: {
          email: { status: "unknown", message: "Unknown" },
          sms: { status: "unknown", message: "Unknown" },
        },
        lastMigration: { message: "Unknown", date: new Date().toISOString() },
        maintenance: false,
      },
    })
  }
}
