import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth-utils"
import { getRecentErrorLogs } from "@/lib/error-logger"
import { isTwilioConfigured } from "@/lib/enhanced-sms-utils"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Gather system status data
    const systemStatus = await getSystemStatus()

    return NextResponse.json({
      success: true,
      status: systemStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching system status:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch system status: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

async function getSystemStatus() {
  const status: Record<string, any> = {
    database: {},
    authentication: {},
    notification: {},
    system: {},
  }

  // Check database status
  try {
    const dbStart = Date.now()
    const dbResult = await db`SELECT 1 as connected`
    const dbEnd = Date.now()

    status.database = {
      status: "ok",
      connected: dbResult[0]?.connected === 1,
      responseTime: `${dbEnd - dbStart}ms`,
    }

    // Get last migration info if available
    try {
      const migrationInfo = await db`
        SELECT table_name, created_at 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY created_at DESC 
        LIMIT 1
      `

      if (migrationInfo && migrationInfo.length > 0) {
        status.database.lastMigration = {
          table: migrationInfo[0].table_name,
          date: migrationInfo[0].created_at,
        }
      } else {
        status.database.lastMigration = "Unknown"
      }
    } catch (err) {
      status.database.lastMigration = "Unknown"
    }
  } catch (error) {
    status.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }

  // Check authentication systems
  try {
    // Check verification system
    const verificationCodesTable = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      ) as exists
    `

    status.authentication.verification = {
      status: verificationCodesTable[0]?.exists ? "active" : "not_configured",
      tableExists: verificationCodesTable[0]?.exists || false,
    }

    // Check password reset system
    const passwordResetTable = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      ) as exists
    `

    status.authentication.passwordReset = {
      status: passwordResetTable[0]?.exists ? "active" : "not_configured",
      tableExists: passwordResetTable[0]?.exists || false,
    }
  } catch (error) {
    status.authentication = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown authentication error",
    }
  }

  // Check notification services
  try {
    // Check email service
    status.notification.email = {
      status: process.env.EMAIL_SERVER ? "configured" : "not_configured",
      server: !!process.env.EMAIL_SERVER,
      from: !!process.env.EMAIL_FROM,
    }

    // Check SMS service
    const twilioConfig = await isTwilioConfigured()
    status.notification.sms = {
      status: twilioConfig.configured ? "configured" : "not_configured",
      configured: twilioConfig.configured,
      missingEnvVars: twilioConfig.missing,
    }
  } catch (error) {
    status.notification = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown notification error",
    }
  }

  // Get system health info
  try {
    // Get recent errors
    const recentErrors = await getRecentErrorLogs(5)
    status.system.errors = {
      count: recentErrors.length,
      recent: recentErrors.map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        context: e.context,
        severity: e.severity,
      })),
    }

    // Get memory usage
    const memoryUsage = process.memoryUsage()
    status.system.memory = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    }

    // Get uptime
    status.system.uptime = `${Math.floor(process.uptime() / 60)} minutes`

    // Get Node.js version
    status.system.nodeVersion = process.version
  } catch (error) {
    status.system = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown system error",
    }
  }

  return status
}
