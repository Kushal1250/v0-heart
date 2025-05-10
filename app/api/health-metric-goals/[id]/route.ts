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

    const goalId = params.id

    const sql = neon(process.env.DATABASE_URL!)

    // Get the goal
    const goal = await sql`
      SELECT id, metric_type, target_value, start_date, target_date, notes, 
             reminder_enabled, reminder_frequency, reminder_days, reminder_time,
             achieved, achieved_date
      FROM health_metric_goals
      WHERE id = ${goalId} AND user_id = ${user.id}
    `

    if (goal.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Parse the target_value field
    let parsedTargetValue = goal[0].target_value

    try {
      // If the value is stored as JSON (for blood pressure, etc.)
      if (
        typeof goal[0].target_value === "string" &&
        (goal[0].target_value.startsWith("{") || goal[0].target_value.startsWith("["))
      ) {
        parsedTargetValue = JSON.parse(goal[0].target_value)
      }
    } catch (e) {
      // If parsing fails, keep the original value
      console.error("Error parsing goal target value:", e)
    }

    // Parse reminder_days if it exists
    let reminderDays = goal[0].reminder_days
    if (reminderDays && typeof reminderDays === "string") {
      try {
        reminderDays = JSON.parse(reminderDays)
      } catch (e) {
        console.error("Error parsing reminder days:", e)
      }
    }

    const formattedGoal = {
      id: goal[0].id,
      metricType: goal[0].metric_type,
      targetValue: parsedTargetValue,
      startDate: goal[0].start_date,
      targetDate: goal[0].target_date,
      notes: goal[0].notes,
      reminderEnabled: goal[0].reminder_enabled,
      reminderFrequency: goal[0].reminder_frequency,
      reminderDays: reminderDays,
      reminderTime: goal[0].reminder_time,
      achieved: goal[0].achieved,
      achievedDate: goal[0].achieved_date,
    }

    return NextResponse.json(formattedGoal)
  } catch (error) {
    console.error("Error fetching health metric goal:", error)
    return NextResponse.json({ error: "Failed to fetch health metric goal" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalId = params.id
    const body = await request.json()

    // Validate required fields
    if (!body.metricType || !body.targetValue || !body.startDate || !body.targetDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Check if the goal exists and belongs to the user
    const existingGoal = await sql`
      SELECT id FROM health_metric_goals
      WHERE id = ${goalId} AND user_id = ${user.id}
    `

    if (existingGoal.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Prepare the target value for storage
    const targetValueToStore =
      typeof body.targetValue === "object" ? JSON.stringify(body.targetValue) : body.targetValue

    // Prepare reminder days for storage if provided
    const reminderDaysToStore = body.reminderDays ? JSON.stringify(body.reminderDays) : null

    // Update the goal
    await sql`
      UPDATE health_metric_goals
      SET 
        metric_type = ${body.metricType},
        target_value = ${targetValueToStore},
        start_date = ${body.startDate},
        target_date = ${body.targetDate},
        notes = ${body.notes || null},
        reminder_enabled = ${body.reminderEnabled || false},
        reminder_frequency = ${body.reminderFrequency || "daily"},
        reminder_days = ${reminderDaysToStore},
        reminder_time = ${body.reminderTime || null},
        achieved = ${body.achieved || false},
        achieved_date = ${body.achievedDate || null}
      WHERE id = ${goalId} AND user_id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: "Health metric goal updated successfully",
    })
  } catch (error) {
    console.error("Error updating health metric goal:", error)
    return NextResponse.json({ error: "Failed to update health metric goal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalId = params.id

    const sql = neon(process.env.DATABASE_URL!)

    // Check if the goal exists and belongs to the user
    const existingGoal = await sql`
      SELECT id FROM health_metric_goals
      WHERE id = ${goalId} AND user_id = ${user.id}
    `

    if (existingGoal.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Delete the goal
    await sql`
      DELETE FROM health_metric_goals
      WHERE id = ${goalId} AND user_id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: "Health metric goal deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting health metric goal:", error)
    return NextResponse.json({ error: "Failed to delete health metric goal" }, { status: 500 })
  }
}
