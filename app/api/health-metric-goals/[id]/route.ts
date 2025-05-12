import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromSession } from "@/lib/auth-utils"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalId = params.id

    const goal = await sql`
      SELECT * FROM health_metric_goals 
      WHERE id = ${Number.parseInt(goalId)} AND user_id = ${user.id}
    `

    if (goal.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json({ goal: goal[0] })
  } catch (error) {
    console.error("Error fetching health metric goal:", error)
    return NextResponse.json({ error: "Failed to fetch health metric goal" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalId = params.id
    const body = await request.json()

    // Check if the goal exists and belongs to the user
    const existingGoal = await sql`
      SELECT * FROM health_metric_goals 
      WHERE id = ${Number.parseInt(goalId)} AND user_id = ${user.id}
    `

    if (existingGoal.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Handle special case for marking as complete
    if (body.completedDate) {
      const updatedGoal = await sql`
        UPDATE health_metric_goals
        SET completed_date = ${body.completedDate}
        WHERE id = ${Number.parseInt(goalId)}
        RETURNING *
      `

      return NextResponse.json({ goal: updatedGoal[0] })
    }

    // Regular update
    const {
      metricType,
      startValue,
      targetValue,
      unit,
      startDate,
      targetDate,
      notes,
      remindersEnabled,
      reminderFrequency,
      reminderDays,
      reminderTime,
    } = body

    // Determine goal type based on metric type
    let goalType = "lower"
    if (["steps", "exercise", "water", "sleep", "cholesterol_hdl"].includes(metricType)) {
      goalType = "higher"
    } else if (["glucose"].includes(metricType)) {
      goalType = "maintain"
    }

    const updatedGoal = await sql`
      UPDATE health_metric_goals
      SET
        metric_type = ${metricType},
        start_value = ${startValue},
        target_value = ${targetValue},
        unit = ${unit},
        start_date = ${startDate},
        target_date = ${targetDate},
        notes = ${notes},
        reminders_enabled = ${remindersEnabled},
        reminder_frequency = ${reminderFrequency},
        reminder_days = ${reminderDays ? JSON.stringify(reminderDays) : null},
        reminder_time = ${reminderTime},
        goal_type = ${goalType},
        updated_at = NOW()
      WHERE id = ${Number.parseInt(goalId)}
      RETURNING *
    `

    return NextResponse.json({ goal: updatedGoal[0] })
  } catch (error) {
    console.error("Error updating health metric goal:", error)
    return NextResponse.json({ error: "Failed to update health metric goal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goalId = params.id

    // Check if the goal exists and belongs to the user
    const existingGoal = await sql`
      SELECT * FROM health_metric_goals 
      WHERE id = ${Number.parseInt(goalId)} AND user_id = ${user.id}
    `

    if (existingGoal.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    await sql`
      DELETE FROM health_metric_goals
      WHERE id = ${Number.parseInt(goalId)}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting health metric goal:", error)
    return NextResponse.json({ error: "Failed to delete health metric goal" }, { status: 500 })
  }
}
