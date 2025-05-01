import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Simple test endpoint to check if the API is working
    return NextResponse.json({
      success: true,
      message: "System status API is working correctly",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in test endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
