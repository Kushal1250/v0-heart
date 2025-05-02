import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { systemLogger } from "@/lib/system-logger"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check if the system_settings table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_settings'
      ) as exists
    `

    if (!tableCheck[0].exists) {
      return NextResponse.json({
        maintenanceMode: false,
        error: "System settings table does not exist",
      })
    }

    // Get the maintenance mode setting
    const result = await sql`
      SELECT value FROM system_settings 
      WHERE key = 'maintenance_mode'
    `

    if (result.length === 0) {
      return NextResponse.json({ maintenanceMode: false })
    }

    const maintenanceMode = result[0].value === "true"

    return NextResponse.json({ maintenanceMode })
  } catch (error) {
    console.error("Error checking maintenance mode:", error)
    await systemLogger("ERROR", "Failed to check maintenance mode", { error: String(error) })
    return NextResponse.json(
      {
        maintenanceMode: false,
        error: "Failed to check maintenance mode",
      },
      { status: 500 },
    )
  }
}
