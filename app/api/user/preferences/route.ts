import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user preferences from database
    const result = await sql`
      SELECT * FROM user_preferences 
      WHERE user_id = ${currentUser.id}
      LIMIT 1
    `.catch(() => null)

    // If no preferences exist yet, return default preferences
    if (!result || result.length === 0) {
      return NextResponse.json({
        notifications: {
          email: true,
          sms: false,
          push: true,
          reminders: true,
          newsletter: false,
          assessment_results: true,
        },
        data_sharing: {
          share_with_doctors: true,
          share_for_research: false,
          anonymized_data_usage: true,
        },
      })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ message: "Failed to fetch user preferences" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Check if preferences already exist for this user
    const existingPrefs = await sql`
      SELECT id FROM user_preferences 
      WHERE user_id = ${currentUser.id}
      LIMIT 1
    `.catch(() => null)

    let result

    if (existingPrefs && existingPrefs.length > 0) {
      // Update existing record
      result = await sql`
        UPDATE user_preferences
        SET 
          notifications = ${JSON.stringify(data.notifications)},
          data_sharing = ${JSON.stringify(data.data_sharing)},
          updated_at = NOW()
        WHERE user_id = ${currentUser.id}
        RETURNING *
      `
    } else {
      // Create new record
      result = await sql`
        INSERT INTO user_preferences (
          user_id,
          notifications,
          data_sharing,
          created_at,
          updated_at
        ) VALUES (
          ${currentUser.id},
          ${JSON.stringify(data.notifications)},
          ${JSON.stringify(data.data_sharing)},
          NOW(),
          NOW()
        )
        RETURNING *
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ message: "Failed to update user preferences" }, { status: 500 })
  }
}
