import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { runDatabaseChecks } from "@/scripts/fix-verification-issues"
import { logError } from "@/lib/error-logger"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Get the session token from cookies
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      console.log("No session token found")
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please log in again.",
        },
        { status: 401 },
      )
    }

    // Check if user is admin - using a more reliable method
    const user = await getUserFromRequest(request)

    // If no user found or not an admin, return 401
    if (!user) {
      console.log("No user found for session token")
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed. Please log in again.",
        },
        { status: 401 },
      )
    }

    if (user.role !== "admin") {
      console.log("User is not an admin:", user.email)
      return NextResponse.json(
        {
          success: false,
          message: "Admin privileges required",
        },
        { status: 403 },
      )
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
