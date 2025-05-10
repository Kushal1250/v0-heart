import { NextResponse } from "next/server"
import { createHealthMetricsTable } from "@/scripts/create-health-metrics-table"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await createHealthMetricsTable()

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating health metrics table:", error)
    return NextResponse.json({ error: "Failed to create health metrics table" }, { status: 500 })
  }
}
