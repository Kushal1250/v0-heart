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

    const sql = neon(process.env.DATABASE_URL!)

    // Build the query
    let query = sql`
      SELECT id, metric_type, target_value, start_date, target_date, notes, 
             reminder_enabled, reminder_frequency, reminder_days, reminder_time,
             achieved, achieved_date
      FROM health_metric_goals
      WHERE user_id = ${user.id}
    `

    // Add type filter if provided
    if (metricType && metricType !== "all") {
      query = sql`
        ${query} AND metric_type = ${metricType}
      `
    }

    // Order by target date
    query = sql`
      ${query} ORDER BY target_date ASC
    `

    const goals = await query

    // Process the results
    const formattedGoals = goals.map((goal: any) => {
      // Parse the target_value field based on the metric type
      let parsedTargetValue = goal.target_value

      try {
        // If the value is stored as JSON (for blood pressure, etc.)
        if (
          typeof goal.target_value === "string" &&
          (goal.target_value.startsWith("{") || goal.target_value.startsWith("["))
        ) {
          parsedTargetValue = JSON.parse(goal.target_value)
        }
      } catch (e) {
        // If parsing fails, keep the original value
        console.error("Error parsing goal target value:", e)
      }

      // Parse reminder_days if it exists
      let reminderDays = goal.reminder_days
      if (reminderDays && typeof reminderDays === "string") {
        try {
          reminderDays = JSON.parse(reminderDays)
        } catch (e) {
          console.error("Error parsing reminder days:", e)
        }
      }

      return {
        id: goal.id,
        metricType: goal.metric_type,
        targetValue: parsedTargetValue,
        startDate: goal.start_date,
        targetDate: goal.target_date,
        notes: goal.notes,
        reminderEnabled: goal.reminder_enabled,
        reminderFrequency: goal.reminder_frequency,
        reminderDays: reminderDays,
        reminderTime: goal.reminder_time,
        achieved: goal.achieved,
        achievedDate: goal.achieved_date,
      }
    })

    return NextResponse.json(formattedGoals)
  } catch (error) {
    console.error("Error fetching health metric goals:", error)
    return NextResponse.json({ error: "Failed to fetch health metric goals" }, { status: 500 })
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
    if (!body.metricType || !body.targetValue || !body.startDate || !body.targetDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Prepare the target value for storage
    // For complex values like blood pressure, store as JSON string
    const targetValueToStore =
      typeof body.targetValue === "object" ? JSON.stringify(body.targetValue) : body.targetValue

    // Prepare reminder days for storage if provided
    const reminderDaysToStore = body.reminderDays ? JSON.stringify(body.reminderDays) : null

    // Insert the new goal
    const result = await sql`
      INSERT INTO health_metric_goals (
        id, 
        user_id, 
        metric_type, 
        target_value, 
        start_date, 
        target_date, 
        notes,
        reminder_enabled,
        reminder_frequency,
        reminder_days,
        reminder_time,
        achieved,
        achieved_date
      ) VALUES (
        ${uuidv4()}, 
        ${user.id}, 
        ${body.metricType}, 
        ${targetValueToStore}, 
        ${body.startDate}, 
        ${body.targetDate}, 
        ${body.notes || null},
        ${body.reminderEnabled || false},
        ${body.reminderFrequency || "daily"},
        ${reminderDaysToStore},
        ${body.reminderTime || null},
        ${body.achieved || false},
        ${body.achievedDate || null}
      ) RETURNING id
    `

    return NextResponse.json({
      success: true,
      message: "Health metric goal added successfully",
      id: result[0].id,
    })
  } catch (error) {
    console.error("Error adding health metric goal:", error)
    return NextResponse.json({ error: "Failed to add health metric goal" }, { status: 500 })
  }
}
