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

    // Check if preferences exist for this user
    const preferences = await sql`
      SELECT * FROM user_preferences WHERE user_id = ${currentUser.id}
    `

    if (preferences.length === 0) {
      // Return default preferences
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
        theme: "dark",
        language: "en-US",
        units: "metric",
      })
    }

    // Return existing preferences
    return NextResponse.json({
      notifications: {
        email: preferences[0].email_notifications,
        sms: preferences[0].sms_notifications,
        push: preferences[0].push_notifications,
        reminders: preferences[0].reminders,
        newsletter: preferences[0].newsletter,
        assessment_results: preferences[0].assessment_results_notifications,
      },
      data_sharing: {
        share_with_doctors: preferences[0].share_with_doctors,
        share_for_research: preferences[0].share_for_research,
        anonymized_data_usage: preferences[0].anonymized_data_usage,
      },
      theme: preferences[0].theme || "dark",
      language: preferences[0].language || "en-US",
      units: preferences[0].units || "metric",
    })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ message: "Failed to fetch preferences" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Extract data
    const notifications = data.notifications || {}
    const data_sharing = data.data_sharing || {}

    // Check if preferences already exist for this user
    const existingPrefs = await sql`
      SELECT id FROM user_preferences WHERE user_id = ${currentUser.id}
    `

    if (existingPrefs.length === 0) {
      // Create new preferences record
      await sql`
        INSERT INTO user_preferences (
          user_id, email_notifications, sms_notifications, 
          push_notifications, reminders, newsletter, 
          assessment_results_notifications, share_with_doctors, 
          share_for_research, anonymized_data_usage, 
          theme, language, units
        ) VALUES (
          ${currentUser.id}, 
          ${notifications.email !== undefined ? notifications.email : true}, 
          ${notifications.sms !== undefined ? notifications.sms : false}, 
          ${notifications.push !== undefined ? notifications.push : true}, 
          ${notifications.reminders !== undefined ? notifications.reminders : true}, 
          ${notifications.newsletter !== undefined ? notifications.newsletter : false}, 
          ${notifications.assessment_results !== undefined ? notifications.assessment_results : true}, 
          ${data_sharing.share_with_doctors !== undefined ? data_sharing.share_with_doctors : true}, 
          ${data_sharing.share_for_research !== undefined ? data_sharing.share_for_research : false}, 
          ${data_sharing.anonymized_data_usage !== undefined ? data_sharing.anonymized_data_usage : true}, 
          ${data.theme || "dark"}, 
          ${data.language || "en-US"}, 
          ${data.units || "metric"}
        )
      `
    } else {
      // Update existing preferences
      await sql`
        UPDATE user_preferences 
        SET 
          email_notifications = COALESCE(${notifications.email !== undefined ? notifications.email : null}, email_notifications),
          sms_notifications = COALESCE(${notifications.sms !== undefined ? notifications.sms : null}, sms_notifications),
          push_notifications = COALESCE(${notifications.push !== undefined ? notifications.push : null}, push_notifications),
          reminders = COALESCE(${notifications.reminders !== undefined ? notifications.reminders : null}, reminders),
          newsletter = COALESCE(${notifications.newsletter !== undefined ? notifications.newsletter : null}, newsletter),
          assessment_results_notifications = COALESCE(${notifications.assessment_results !== undefined ? notifications.assessment_results : null}, assessment_results_notifications),
          share_with_doctors = COALESCE(${data_sharing.share_with_doctors !== undefined ? data_sharing.share_with_doctors : null}, share_with_doctors),
          share_for_research = COALESCE(${data_sharing.share_for_research !== undefined ? data_sharing.share_for_research : null}, share_for_research),
          anonymized_data_usage = COALESCE(${data_sharing.anonymized_data_usage !== undefined ? data_sharing.anonymized_data_usage : null}, anonymized_data_usage),
          theme = COALESCE(${data.theme || null}, theme),
          language = COALESCE(${data.language || null}, language),
          units = COALESCE(${data.units || null}, units),
          updated_at = NOW()
        WHERE user_id = ${currentUser.id}
      `
    }

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
    })
  } catch (error) {
    console.error("Error updating preferences:", error)
    return NextResponse.json({ message: "Failed to update preferences" }, { status: 500 })
  }
}
