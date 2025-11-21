import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromRequest } from "@/lib/auth-utils"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req as any)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await sql`
      SELECT * FROM user_settings WHERE user_id = ${user.id}
    `

    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        theme: "dark",
        saveHistory: true,
        notifications: false,
        emailNotifications: false,
        dataSharing: false,
        language: "english",
        units: "metric",
        privacyMode: false,
      })
    }

    // Format the response to use camelCase for frontend consistency
    return NextResponse.json({
      theme: settings[0].theme,
      saveHistory: settings[0].save_history,
      notifications: settings[0].notifications,
      emailNotifications: settings[0].email_notifications,
      dataSharing: settings[0].data_sharing,
      language: settings[0].language,
      units: settings[0].units,
      privacyMode: settings[0].privacy_mode,
    })
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req as any)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { theme, saveHistory, notifications, emailNotifications, dataSharing, language, units, privacyMode } = data

    // Validate settings
    if (theme !== undefined && theme !== "dark" && theme !== "light") {
      return NextResponse.json({ error: "Invalid theme value" }, { status: 400 })
    }

    if (language !== undefined && !["english", "spanish", "french", "german", "chinese"].includes(language)) {
      return NextResponse.json({ error: "Invalid language value" }, { status: 400 })
    }

    if (units !== undefined && !["metric", "imperial"].includes(units)) {
      return NextResponse.json({ error: "Invalid units value" }, { status: 400 })
    }

    // Check if settings exist
    const existingSettings = await sql`
      SELECT id FROM user_settings WHERE user_id = ${user.id}
    `

    if (existingSettings.length === 0) {
      // Create new settings
      await sql`
        INSERT INTO user_settings (
          user_id, theme, save_history, notifications, email_notifications, 
          data_sharing, language, units, privacy_mode
        ) VALUES (
          ${user.id}, ${theme || "dark"}, ${saveHistory !== undefined ? saveHistory : true}, 
          ${notifications !== undefined ? notifications : false}, 
          ${emailNotifications !== undefined ? emailNotifications : false},
          ${dataSharing !== undefined ? dataSharing : false}, 
          ${language || "english"}, ${units || "metric"}, 
          ${privacyMode !== undefined ? privacyMode : false}
        )
      `
    } else {
      // Update existing settings
      await sql`
        UPDATE user_settings SET
          theme = COALESCE(${theme}, theme),
          save_history = COALESCE(${saveHistory !== undefined ? saveHistory : null}, save_history),
          notifications = COALESCE(${notifications !== undefined ? notifications : null}, notifications),
          email_notifications = COALESCE(${emailNotifications !== undefined ? emailNotifications : null}, email_notifications),
          data_sharing = COALESCE(${dataSharing !== undefined ? dataSharing : null}, data_sharing),
          language = COALESCE(${language}, language),
          units = COALESCE(${units}, units),
          privacy_mode = COALESCE(${privacyMode !== undefined ? privacyMode : null}, privacy_mode),
          updated_at = NOW()
        WHERE user_id = ${user.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
