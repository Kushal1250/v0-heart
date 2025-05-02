import { NextResponse } from "next/server"
import { initializeSystemSettings } from "@/scripts/initialize-system-settings"
import { verifyAdminSession } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Initialize system settings
    const result = await initializeSystemSettings()

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Failed to initialize system settings" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "System initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing system:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
