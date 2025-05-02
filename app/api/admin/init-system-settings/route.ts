import { type NextRequest, NextResponse } from "next/server"
import { createSystemSettingsTable } from "@/scripts/create-system-settings-table"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdminUser = await isAdmin(request)
    if (!isAdminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await createSystemSettingsTable()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error initializing system settings:", error)
    return NextResponse.json({ error: "Failed to initialize system settings" }, { status: 500 })
  }
}
