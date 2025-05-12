import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get health reminders from database
    const result = await sql`
      SELECT * FROM user_health_reminders 
      WHERE user_id = ${currentUser.id}
      ORDER BY reminder_date ASC
    `.catch(() => null)

    // If no reminders exist yet, return empty array
    if (!result || result.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching health reminders:", error)
    return NextResponse.json({ message: "Failed to fetch health reminders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Create new reminder
    const result = await sql`
      INSERT INTO user_health_reminders (
        user_id,
        reminder_type,
        reminder_date,
        reminder_notes,
        created_at
      ) VALUES (
        ${currentUser.id},
        ${data.type || "health_check"},
        ${data.date},
        ${data.notes || null},
        NOW()
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating health reminder:", error)
    return NextResponse.json({ message: "Failed to create health reminder" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reminderId = searchParams.get("id")

    if (!reminderId) {
      return NextResponse.json({ message: "Reminder ID is required" }, { status: 400 })
    }

    // Delete reminder
    await sql`
      DELETE FROM user_health_reminders 
      WHERE user_id = ${currentUser.id} AND id = ${reminderId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting health reminder:", error)
    return NextResponse.json({ message: "Failed to delete health reminder" }, { status: 500 })
  }
}
