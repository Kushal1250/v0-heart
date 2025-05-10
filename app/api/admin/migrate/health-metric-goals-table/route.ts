import { NextResponse } from "next/server"
import { createHealthMetricGoalsTable } from "@/scripts/create-health-metric-goals-table"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await createHealthMetricGoalsTable()

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in migration endpoint:", error)
    return NextResponse.json({ error: "Migration failed" }, { status: 500 })
  }
}
