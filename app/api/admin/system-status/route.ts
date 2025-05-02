import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Check database connection
    let databaseStatus = {
      status: "unknown" as const,
      message: "Database status is unknown",
      lastChecked: new Date().toISOString(),
    }

    try {
      await sql`SELECT 1`
      databaseStatus = {
        status: "configured" as const,
        message: "Database is connected and working properly",
        lastChecked: new Date().toISOString(),
      }
    } catch (error) {
      databaseStatus = {
        status: "error" as const,
        message: "Failed to connect to database",
        lastChecked: new Date().toISOString(),
      }
    }

    // Check email configuration
    const emailStatus = {
      status: "not_configured" as const,
      message: "Email service is not configured",
      lastChecked: new Date().toISOString(),
    }

    if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
      emailStatus.status = "configured"
      emailStatus.message = "Email service is configured"
    }

    // Check SMS configuration
    const smsStatus = {
      status: "not_configured" as const,
      message: "SMS service is not configured",
      lastChecked: new Date().toISOString(),
    }

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      smsStatus.status = "configured"
      smsStatus.message = "SMS service is configured"
    }

    // Check last migration
    let lastMigration = {
      date: "Unknown",
      status: "unknown" as const,
    }

    try {
      const migrationResult = await sql`
        SELECT created_at, status FROM migrations 
        ORDER BY created_at DESC LIMIT 1
      `

      if (migrationResult && migrationResult.length > 0) {
        const migration = migrationResult[0]
        lastMigration = {
          date: new Date(migration.created_at).toISOString(),
          status: migration.status === "success" ? "success" : "failed",
        }
      }
    } catch (error) {
      console.error("Failed to check migration status:", error)
    }

    return NextResponse.json({
      database: databaseStatus,
      emailService: emailStatus,
      smsService: smsStatus,
      lastMigration,
    })
  } catch (error) {
    console.error("Error getting system status:", error)
    return NextResponse.json({ error: "Failed to get system status" }, { status: 500 })
  }
}
