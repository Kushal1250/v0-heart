import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { deletePredictionById, getPredictionById } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const predictionId = params.id

    if (!predictionId) {
      return NextResponse.json({ error: "Prediction ID is required" }, { status: 400 })
    }

    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the prediction belongs to this user
    const prediction = await getPredictionById(predictionId)

    if (!prediction) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 })
    }

    if (prediction.user_id !== user.id) {
      // Security log for potential unauthorized access attempt
      console.warn(
        `User ${user.id} attempted to delete prediction ${predictionId} belonging to user ${prediction.user_id}`,
      )
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    // Delete the prediction
    await deletePredictionById(predictionId)

    // Log for security auditing
    console.log(`User ${user.id} deleted prediction ${predictionId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prediction:", error)
    return NextResponse.json({ error: "Failed to delete prediction" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const predictionId = params.id

    if (!predictionId) {
      return NextResponse.json({ error: "Prediction ID is required" }, { status: 400 })
    }

    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the prediction
    const prediction = await getPredictionById(predictionId)

    if (!prediction) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 })
    }

    // Verify the prediction belongs to this user
    if (prediction.user_id !== user.id) {
      // Security log for potential unauthorized access attempt
      console.warn(
        `User ${user.id} attempted to access prediction ${predictionId} belonging to user ${prediction.user_id}`,
      )
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error fetching prediction:", error)
    return NextResponse.json({ error: "Failed to fetch prediction" }, { status: 500 })
  }
}
