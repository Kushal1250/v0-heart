import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromRequest } from "@/lib/auth-utils"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const metricType = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Validate parameters
    if (!metricType) {
      return NextResponse.json({ error: "Metric type is required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Build the query
    let query = sql`
      SELECT id, type, value, unit, timestamp, notes
      FROM health_metrics
      WHERE user_id = ${user.id}
    `

    // Add type filter if provided
    if (metricType !== "all") {
      query = sql`
        ${query} AND type = ${metricType}
      `
    }

    // Add date range filters if provided
    if (startDate) {
      query = sql`
        ${query} AND timestamp >= ${startDate}
      `
    }

    if (endDate) {
      query = sql`
        ${query} AND timestamp <= ${endDate}
      `
    }

    // Order by timestamp
    query = sql`
      ${query} ORDER BY timestamp ASC
    `

    const metrics = await query

    // Process the results
    const formattedMetrics = metrics.map((metric: any) => {
      // Parse the value field based on the metric type
      let parsedValue = metric.value

      try {
        // If the value is stored as JSON (for blood pressure, etc.)
        if (typeof metric.value === "string" && (metric.value.startsWith("{") || metric.value.startsWith("["))) {
          parsedValue = JSON.parse(metric.value)
        }
      } catch (e) {
        // If parsing fails, keep the original value
        console.error("Error parsing metric value:", e)
      }

      return {
        id: metric.id,
        type: metric.type,
        value: parsedValue,
        unit: metric.unit,
        timestamp: metric.timestamp,
        notes: metric.notes,
      }
    })

    return NextResponse.json(formattedMetrics)
  } catch (error) {
    console.error("Error fetching health metrics:", error)
    return NextResponse.json({ error: "Failed to fetch health metrics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()

    // Validate required fields
    if (!body.type || !body.value || !body.unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Prepare the value for storage
    // For complex values like blood pressure, store as JSON string
    const valueToStore = typeof body.value === "object" ? JSON.stringify(body.value) : body.value

    // Insert the new metric
    const result = await sql`
      INSERT INTO health_metrics (
        id, 
        user_id, 
        type, 
        value, 
        unit, 
        timestamp, 
        notes
      ) VALUES (
        ${uuidv4()}, 
        ${user.id}, 
        ${body.type}, 
        ${valueToStore}, 
        ${body.unit}, 
        ${body.timestamp || new Date().toISOString()}, 
        ${body.notes || null}
      ) RETURNING id
    `

    return NextResponse.json({
      success: true,
      message: "Health metric added successfully",
      id: result[0].id,
    })
  } catch (error) {
    console.error("Error adding health metric:", error)
    return NextResponse.json({ error: "Failed to add health metric" }, { status: 500 })
  }
}
