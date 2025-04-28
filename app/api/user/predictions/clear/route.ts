import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete all predictions for this user
    await sql`DELETE FROM predictions WHERE user_id = ${user.id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing user predictions:", error)
    return NextResponse.json({ error: "Failed to clear predictions" }, { status: 500 })
  }
}
