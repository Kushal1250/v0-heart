import { type NextRequest, NextResponse } from "next/server"
import { createHealthMetricGoalsTable } from "@/scripts/create-health-metric-goals-table"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Check if the user is an admin
    const isUserAdmin = await isAdmin()

    if (!isUserAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    const result = await createHealthMetricGoalsTable()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Health metric goals table created successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create health metric goals table",
          details: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in health metric goals table migration:", error)
    return NextResponse.json({ error: "Failed to run migration" }, { status: 500 })
  }
}
