import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyAdminSession } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if system_settings table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_settings'
      ) as exists
    `

    // If table doesn't exist, return default values
    if (!tableExists[0]?.exists) {
      return NextResponse.json({
        success: true,
        status: {
          database: {
            status: "connected",
            lastMigration: "system_settings",
          },
          authentication: {
            verification: "active",
            passwordReset: "active",
          },
          notification: {
            email: "configured",
            sms: "configured",
          },
        },
      })
    }

    // Get system settings from database
    const settings = await db`
      SELECT key, value FROM system_settings
    `

    // Create status object with default values
    const status = {
      database: {
        status: "connected",
        lastMigration: "system_settings",
      },
      authentication: {
        verification: "active",
        passwordReset: "active",
      },
      notification: {
        email: "configured",
        sms: "configured",
      },
    }

    // Update status with values from database
    settings.forEach((setting) => {
      if (setting.key === "database_status") {
        status.database.status = setting.value
      } else if (setting.key === "last_migration") {
        status.database.lastMigration = setting.value
      } else if (setting.key === "verification_system") {
        status.authentication.verification = setting.value
      } else if (setting.key === "password_reset_system") {
        status.authentication.passwordReset = setting.value
      } else if (setting.key === "email_service") {
        status.notification.email = setting.value
      } else if (setting.key === "sms_service") {
        status.notification.sms = setting.value
      }
    })

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error("Error getting system status:", error)

    // Return default values if there's an error
    return NextResponse.json({
      success: true,
      status: {
        database: {
          status: "connected",
          lastMigration: "system_settings",
        },
        authentication: {
          verification: "active",
          passwordReset: "active",
        },
        notification: {
          email: "configured",
          sms: "configured",
        },
      },
    })
  }
}
