import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { backupSystemIndicators } from "@/scripts/backup-system-indicators"

export async function POST(request: Request) {
  try {
    const isAdmin = (await cookies()).get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Backup System Indicators API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    const result = await backupSystemIndicators()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to backup system indicators",
          error: result.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error backing up system indicators:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to backup system indicators",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
