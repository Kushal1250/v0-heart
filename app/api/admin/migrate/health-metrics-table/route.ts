import { NextResponse } from "next/server"
import { createHealthMetricsTable } from "@/scripts/create-health-metrics-table"
import { getCurrentUser } from "@/lib/auth-utils"

export async function POST() {
  try {
    // Check if the current user is an admin
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Run the migration
    const result = await createHealthMetricsTable()

    if (!result.success) {
      return NextResponse.json({ message: result.message, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error("Error running health metrics table migration:", error)
    return NextResponse.json(
      { message: "Failed to create health metrics table", error: String(error) },
      { status: 500 },
    )
  }
}
