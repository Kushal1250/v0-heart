import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get health reminders for this user
    const reminders = await sql`
      SELECT * FROM health_reminders WHERE user_id = ${currentUser.id}
      ORDER BY reminder_date ASC
    `

    return NextResponse.json(
      reminders.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        date: reminder.reminder_date,
        completed: reminder.completed,
      })),
    )
  } catch (error) {
    console.error("Error fetching health reminders:", error)
    return NextResponse.json({ message: "Failed to fetch health reminders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Create a new health reminder
    const result = await sql`
      INSERT INTO health_reminders (
        user_id, title, description, reminder_date, completed
      ) VALUES (
        ${currentUser.id}, 
        ${data.title || "Health Check"}, 
        ${data.description || "Regular health check reminder"}, 
        ${data.date}, 
        false
      )
      RETURNING id, title, description, reminder_date, completed
    `

    return NextResponse.json({
      success: true,
      message: "Reminder set successfully",
      reminder: {
        id: result[0].id,
        title: result[0].title,
        description: result[0].description,
        date: result[0].reminder_date,
        completed: result[0].completed,
      },
    })
  } catch (error) {
    console.error("Error setting reminder:", error)
    return NextResponse.json({ message: "Failed to set reminder" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    if (!data.id) {
      return NextResponse.json({ message: "Reminder ID is required" }, { status: 400 })
    }

    // Update the reminder
    await sql`
      UPDATE health_reminders 
      SET 
        title = COALESCE(${data.title || null}, title),
        description = COALESCE(${data.description || null}, description),
        reminder_date = COALESCE(${data.date || null}, reminder_date),
        completed = COALESCE(${data.completed !== undefined ? data.completed : null}, completed),
        updated_at = NOW()
      WHERE id = ${data.id} AND user_id = ${currentUser.id}
    `

    return NextResponse.json({
      success: true,
      message: "Reminder updated successfully",
    })
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json({ message: "Failed to update reminder" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reminderId = searchParams.get("id")

    if (!reminderId) {
      return NextResponse.json({ message: "Reminder ID is required" }, { status: 400 })
    }

    // Delete the reminder
    await sql`
      DELETE FROM health_reminders 
      WHERE id = ${reminderId} AND user_id = ${currentUser.id}
    `

    return NextResponse.json({
      success: true,
      message: "Reminder deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json({ message: "Failed to delete reminder" }, { status: 500 })
  }
}
