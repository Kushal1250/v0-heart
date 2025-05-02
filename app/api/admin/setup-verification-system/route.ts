import { NextResponse } from "next/server"
import { setupVerificationSystem } from "@/scripts/setup-verification-system"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const result = await setupVerificationSystem()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in setup verification system API:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
