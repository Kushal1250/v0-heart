import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { getPredictionsByUserId } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`Fetching predictions for user: ${user.email} (ID: ${user.id})`)

    // Fetch predictions for this user only
    const predictions = await getPredictionsByUserId(user.id)

    console.log(`Found ${predictions.length} predictions for user ${user.email}`)

    return NextResponse.json(predictions)
  } catch (error) {
    console.error("Error fetching user predictions:", error)
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 })
  }
}
