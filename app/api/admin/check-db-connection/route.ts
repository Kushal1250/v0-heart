import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Test database connection
    const result = await db`SELECT NOW() as time`

    return NextResponse.json({
      success: true,
      connected: true,
      timestamp: result[0].time,
    })
  } catch (error) {
    console.error("Database connection failed:", error)
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}
