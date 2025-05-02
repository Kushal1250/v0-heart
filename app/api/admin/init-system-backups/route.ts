import { NextResponse } from "next/server"
import { createSystemBackupsTable } from "@/scripts/create-system-backups-table"
import { systemLogger } from "@/lib/system-logger"
import { verifyAuth } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request)
    if (!authResult.isAuthenticated || authResult.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await createSystemBackupsTable()

    if (result.success) {
      await systemLogger("INFO", "System backups table initialized", {
        userId: authResult.user?.id,
      })

      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      await systemLogger("ERROR", "Failed to initialize system backups table", {
        error: result.error,
      })

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error initializing system backups table:", error)
    await systemLogger("ERROR", "Failed to initialize system backups table", {
      error: String(error),
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize system backups table",
      },
      { status: 500 },
    )
  }
}
