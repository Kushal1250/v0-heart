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
      return NextResponse.json({ error: "Unauthorized - Please log in to delete predictions" }, { status: 401 })
    }

    // First verify the prediction belongs to this user
    const verifyOwnership = await sql`
      SELECT id FROM predictions 
      WHERE id = ${predictionId} AND user_id = ${user.id}
    `

    if (verifyOwnership.length === 0) {
      // Either the prediction doesn't exist or it doesn't belong to this user
      // We return the same error message either way to avoid information leakage
      return NextResponse.json(
        { error: "Prediction not found or you don't have permission to delete it" },
        { status: 404 },
      )
    }

    // Now delete the prediction
    await sql`DELETE FROM predictions WHERE id = ${predictionId} AND user_id = ${user.id}`

    // Log for security auditing
    console.log(`User ${user.id} deleted prediction ${predictionId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prediction:", error)
    return NextResponse.json({ error: "Failed to delete prediction" }, { status: 500 })
  }
}
