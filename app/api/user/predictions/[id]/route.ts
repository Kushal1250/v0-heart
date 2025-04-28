import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const predictionId = params.id

    // Get the authenticated user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`Attempting to delete prediction ${predictionId} for user ${user.email}`)

    // Delete the prediction, but only if it belongs to this user
    const result = await sql`
      DELETE FROM predictions 
      WHERE id = ${predictionId} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Prediction not found or not authorized to delete" }, { status: 404 })
    }

    console.log(`Successfully deleted prediction ${predictionId} for user ${user.email}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prediction:", error)
    return NextResponse.json({ error: "Failed to delete prediction" }, { status: 500 })
  }
}
