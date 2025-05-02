import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { systemLogger } from "@/lib/system-logger"
import { verifyAuth } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request)
    if (!authResult.isAuthenticated || authResult.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Generate a backup ID
    const backupId = `backup_${Date.now()}`

    // Get all system settings
    const systemSettings = await sql`
      SELECT * FROM system_settings
    `

    // Create a backup record
    await sql`
      INSERT INTO system_backups (
        backup_id, 
        backup_data, 
        created_at, 
        created_by
      ) VALUES (
        ${backupId}, 
        ${JSON.stringify(systemSettings)}, 
        NOW(), 
        ${authResult.user?.id || "system"}
      )
    `

    // Log the backup creation
    await systemLogger("INFO", "System backup created", {
      backupId,
      userId: authResult.user?.id,
    })

    return NextResponse.json({
      success: true,
      backupId,
      message: "Backup created successfully",
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    await systemLogger("ERROR", "Failed to create system backup", { error: String(error) })
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create backup",
      },
      { status: 500 },
    )
  }
}
