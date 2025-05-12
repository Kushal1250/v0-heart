import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromSession } from "@/lib/auth-utils"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const updatedGoal = await sql`
      UPDATE health_metric_goals
      SET 
        completed_date = NOW(),
        updated_at = NOW()
      WHERE id = ${Number.parseInt(goalId)}
      RETURNING *
    `

    return NextResponse.json({ goal: updatedGoal[0] })
  } catch (error) {
    console.error("Error completing health metric goal:", error)
    return NextResponse.json({ error: "Failed to complete health metric goal" }, { status: 500 })
  }
}
