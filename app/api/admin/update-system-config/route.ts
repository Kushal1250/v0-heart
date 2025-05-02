import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdminUser = await isAdmin(request)
    if (!isAdminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { setting, value } = await request.json()

    // Validate input
    if (!setting || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // List of allowed settings
    const allowedSettings = ["maintenanceMode", "debugMode", "emailNotifications", "smsNotifications"]

    if (!allowedSettings.includes(setting)) {
      return NextResponse.json({ error: "Invalid setting" }, { status: 400 })
    }

    // Update the setting in the database
    // First check if the setting exists
    const existingResult = await db.query("SELECT * FROM system_settings WHERE setting_name = $1", [setting])

    if (existingResult.rows.length > 0) {
      // Update existing setting
      await db.query("UPDATE system_settings SET setting_value = $1, updated_at = NOW() WHERE setting_name = $2", [
        value.toString(),
        setting,
      ])
    } else {
      // Insert new setting
      await db.query(
        "INSERT INTO system_settings (setting_name, setting_value, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())",
        [setting, value.toString()],
      )
    }

    // Special handling for maintenance mode
    if (setting === "maintenanceMode") {
      // Log the maintenance mode change
      await db.query("INSERT INTO system_logs (log_type, message, created_at) VALUES ($1, $2, NOW())", [
        "MAINTENANCE_MODE",
        `Maintenance mode ${value ? "enabled" : "disabled"}`,
      ])
    }

    return NextResponse.json({
      success: true,
      message: `${setting} updated successfully`,
    })
  } catch (error) {
    console.error("Error updating system config:", error)
    return NextResponse.json({ error: "Failed to update system configuration" }, { status: 500 })
  }
}
