import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { getPredictionsByUserId } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized - Please log in to view your history" }, { status: 401 })
    }

    // Fetch predictions for this user only
    const predictions = await getPredictionsByUserId(user.id)

    // Log for security auditing (without exposing sensitive data)
    console.log(`User ${user.id} accessed their predictions (${predictions.length} records)`)

    return NextResponse.json(predictions)
  } catch (error) {
    console.error("Error fetching user predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}
