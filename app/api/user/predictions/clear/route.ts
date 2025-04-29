import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { clearUserPredictions } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Clear all predictions for this user
    await clearUserPredictions(user.id)

    // Log for security auditing
    console.log(`User ${user.id} cleared all their predictions`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing predictions:", error)
    return NextResponse.json({ error: "Failed to clear predictions" }, { status: 500 })
  }
}
