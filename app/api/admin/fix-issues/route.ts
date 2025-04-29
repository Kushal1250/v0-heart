import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { runDatabaseChecks } from "@/scripts/fix-verification-issues"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Run fixes
    const results = await runDatabaseChecks()

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error fixing issues:", error)
    await logError("fixIssues", error)

    return NextResponse.json(
      {
        success: false,
        message: `Failed to fix issues: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
