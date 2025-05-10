import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const metricId = params.id

    const sql = neon(process.env.DATABASE_URL!)

    // Get the metric
    const metric = await sql`
      SELECT id, type, value, unit, timestamp, notes
      FROM health_metrics
      WHERE id = ${metricId} AND user_id = ${user.id}
    `

    if (metric.length === 0) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 })
    }

    // Parse the value field if it's stored as JSON
    let parsedValue = metric[0].value

    try {
      if (typeof metric[0].value === "string" && (metric[0].value.startsWith("{") || metric[0].value.startsWith("["))) {
        parsedValue = JSON.parse(metric[0].value)
      }
    } catch (e) {
      console.error("Error parsing metric value:", e)
    }

    return NextResponse.json({
      id: metric[0].id,
      type: metric[0].type,
      value: parsedValue,
      unit: metric[0].unit,
      timestamp: metric[0].timestamp,
      notes: metric[0].notes,
    })
  } catch (error) {
    console.error("Error fetching health metric:", error)
    return NextResponse.json({ error: "Failed to fetch health metric" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const metricId = params.id
    const body = await request.json()

    // Validate that the metric exists and belongs to the user
    const sql = neon(process.env.DATABASE_URL!)

    const existingMetric = await sql`
      SELECT id FROM health_metrics
      WHERE id = ${metricId} AND user_id = ${user.id}
    `

    if (existingMetric.length === 0) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 })
    }

    // Prepare the value for storage
    const valueToStore = typeof body.value === "object" ? JSON.stringify(body.value) : body.value

    // Update the metric
    await sql`
      UPDATE health_metrics
      SET 
        value = COALESCE(${valueToStore}, value),
        unit = COALESCE(${body.unit}, unit),
        timestamp = COALESCE(${body.timestamp}, timestamp),
        notes = COALESCE(${body.notes}, notes)
      WHERE id = ${metricId} AND user_id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: "Health metric updated successfully",
    })
  } catch (error) {
    console.error("Error updating health metric:", error)
    return NextResponse.json({ error: "Failed to update health metric" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const metricId = params.id

    const sql = neon(process.env.DATABASE_URL!)

    // Validate that the metric exists and belongs to the user
    const existingMetric = await sql`
      SELECT id FROM health_metrics
      WHERE id = ${metricId} AND user_id = ${user.id}
    `

    if (existingMetric.length === 0) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 })
    }

    // Delete the metric
    await sql`
      DELETE FROM health_metrics
      WHERE id = ${metricId} AND user_id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: "Health metric deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting health metric:", error)
    return NextResponse.json({ error: "Failed to delete health metric" }, { status: 500 })
  }
}
