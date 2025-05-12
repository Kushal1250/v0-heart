import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromSession } from "@/lib/auth-utils"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tab = searchParams.get("tab") || "all"

    let query = `
      SELECT * FROM health_metric_goals 
      WHERE user_id = $1
    `

    if (tab === "active") {
      query += " AND completed_date IS NULL"
    } else if (tab === "completed") {
      query += " AND completed_date IS NOT NULL"
    }

    query += " ORDER BY created_at DESC"

    const goals = await sql(query, [user.id])

    return NextResponse.json({ goals })
  } catch (error) {
    console.error("Error fetching health metric goals:", error)
    return NextResponse.json({ error: "Failed to fetch health metric goals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
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

    const result = await sql`
      INSERT INTO health_metric_goals (
        user_id,
        metric_type,
        start_value,
        current_value,
        target_value,
        unit,
        start_date,
        target_date,
        notes,
        reminders_enabled,
        reminder_frequency,
        reminder_days,
        reminder_time,
        goal_type
      ) VALUES (
        ${user.id},
        ${metricType},
        ${startValue},
        ${startValue},
        ${targetValue},
        ${unit},
        ${startDate},
        ${targetDate},
        ${notes},
        ${remindersEnabled},
        ${reminderFrequency},
        ${reminderDays ? JSON.stringify(reminderDays) : null},
        ${reminderTime},
        ${goalType}
      )
      RETURNING *
    `

    return NextResponse.json({ goal: result[0] })
  } catch (error) {
    console.error("Error creating health metric goal:", error)
    return NextResponse.json({ error: "Failed to create health metric goal" }, { status: 500 })
  }
}
