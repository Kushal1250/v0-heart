import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const isAdmin = (await cookies()).get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Update System Indicators API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Check if system_settings table exists
    const checkSystemSettingsTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'system_settings'
    `

    // If system_settings table doesn't exist, create it
    if (checkSystemSettingsTable.length === 0) {
      await sql`
        CREATE TABLE system_settings (
          id SERIAL PRIMARY KEY,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log("Created system_settings table")
    }

    // Update system status indicators
    const indicators = [
      { key: "database_status", value: "connected" },
      { key: "verification_system", value: "active" },
      { key: "password_reset_system", value: "active" },
      { key: "email_service", value: "configured" },
      { key: "sms_service", value: "configured" },
      { key: "last_migration", value: "completed" },
    ]

    for (const indicator of indicators) {
      // Check if indicator exists
      const checkIndicator = await sql`
        SELECT * FROM system_settings WHERE key = ${indicator.key}
      `

      if (checkIndicator.length === 0) {
        // Insert new indicator
        await sql`
          INSERT INTO system_settings (key, value)
          VALUES (${indicator.key}, ${indicator.value})
        `
      } else {
        // Update existing indicator
        await sql`
          UPDATE system_settings
          SET value = ${indicator.value}, updated_at = CURRENT_TIMESTAMP
          WHERE key = ${indicator.key}
        `
      }
    }

    return NextResponse.json({
      success: true,
      message: "System indicators updated successfully",
    })
  } catch (error) {
    console.error("Error updating system indicators:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update system indicators",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
