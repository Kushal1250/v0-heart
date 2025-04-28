import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const predictionId = params.id

    if (!predictionId) {
      return NextResponse.json({ error: "Prediction ID is required" }, { status: 400 })
    }

    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Important: Only delete the prediction if it belongs to the authenticated user
    const result = await sql`
      DELETE FROM predictions 
      WHERE id = ${predictionId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Prediction not found or does not belong to the authenticated user" },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prediction:", error)
    return NextResponse.json({ error: "Failed to delete prediction" }, { status: 500 })
  }
}
