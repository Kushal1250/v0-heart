import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth-utils"
import { getRecentErrorLogs, ErrorSeverity } from "@/lib/error-logger"
import { isTwilioConfigured } from "@/lib/enhanced-sms-utils"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Run system diagnostics
    const diagnostics = await runSystemDiagnostics()

    return NextResponse.json({
      success: true,
      diagnostics,
    })
  } catch (error) {
    console.error("Error running diagnostics:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to run diagnostics: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

async function runSystemDiagnostics() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    services: {},
  }

  // Check database connection
  try {
    const dbStart = Date.now()
    const dbResult = await db`SELECT 1 as connected`
    const dbEnd = Date.now()

    results.services.database = {
      status: "ok",
      connected: dbResult[0]?.connected === 1,
      responseTime: `${dbEnd - dbStart}ms`,
    }
  } catch (error) {
    results.services.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }

  // Check SMS service
  try {
    const twilioConfig = await isTwilioConfigured()
    results.services.sms = {
      status: twilioConfig.configured ? "ok" : "misconfigured",
      configured: twilioConfig.configured,
      missingEnvVars: twilioConfig.missing,
    }
  } catch (error) {
    results.services.sms = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown SMS service error",
    }
  }

  // Check email service
  results.services.email = {
    status: process.env.EMAIL_SERVER ? "configured" : "misconfigured",
    server: !!process.env.EMAIL_SERVER,
    from: !!process.env.EMAIL_FROM,
  }

  // Get recent errors
  try {
    const recentErrors = await getRecentErrorLogs(10)
    results.recentErrors = {
      count: recentErrors.length,
      critical: recentErrors.filter((e) => e.severity === ErrorSeverity.CRITICAL).length,
      high: recentErrors.filter((e) => e.severity === ErrorSeverity.HIGH).length,
      latest: recentErrors.slice(0, 3).map((e) => ({
        id: e.id,
        timestamp: e.timestamp,
        context: e.context,
        message: e.message,
        severity: e.severity,
      })),
    }
  } catch (error) {
    results.recentErrors = {
      status: "error",
      error: error instanceof Error ? error.message : "Failed to retrieve recent errors",
    }
  }

  // Check verification codes table structure
  try {
    const verificationCodesTable = await db`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'verification_codes'
    `

    results.tables = {
      verificationCodes: {
        exists: verificationCodesTable.length > 0,
        columns: verificationCodesTable.map((col) => ({
          name: col.column_name,
          type: col.data_type,
        })),
      },
    }

    // Check if user_id column is TEXT (not UUID)
    const userIdColumn = verificationCodesTable.find((col) => col.column_name === "user_id")
    if (userIdColumn) {
      results.tables.verificationCodes.userIdType = userIdColumn.data_type
      results.tables.verificationCodes.userIdCorrect = userIdColumn.data_type.toLowerCase() === "text"
    }
  } catch (error) {
    results.tables = {
      status: "error",
      error: error instanceof Error ? error.message : "Failed to check table structure",
    }
  }

  return results
}
