import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const isAdmin = (await cookies()).get("is_admin")?.value === "true"

    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const predictionId = params.id

    if (!predictionId) {
      return NextResponse.json({ error: "Prediction ID is required" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM predictions
      WHERE id = $1
      RETURNING id
    `[predictionId]

    if (result.length === 0) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Prediction deleted successfully",
      id: predictionId,
    })
  } catch (error) {
    console.error("Error deleting prediction:", error)
    return NextResponse.json(
      {
        error: "Failed to delete prediction",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
