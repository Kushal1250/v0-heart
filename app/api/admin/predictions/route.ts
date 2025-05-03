import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Check admin authentication
    const isAdmin = cookies().get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Predictions API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Check if predictions table exists
    const checkTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'predictions'
    `

    // If table doesn't exist, return empty array
    if (checkTable.length === 0) {
      console.log("Predictions table doesn't exist yet. Please run migration.")
      return NextResponse.json({
        predictions: [],
        message: "Predictions table doesn't exist yet. Please run migration.",
      })
    }

    // Fetch predictions with user information
    const predictions = await sql`
      SELECT p.*, u.name, u.email
      FROM predictions p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `

    // Transform the data to match the expected format
    const formattedPredictions = predictions.map((pred) => ({
      id: pred.id,
      userId: pred.user_id,
      userName: pred.name || pred.email || "Unknown User",
      result: Number.parseFloat(pred.result),
      timestamp: pred.created_at,
      data: pred.prediction_data || {},
    }))

    return NextResponse.json({ predictions: formattedPredictions })
  } catch (error) {
    console.error("Error fetching predictions:", error)

    // Check if the error is about the missing table
    if (error instanceof Error && error.message.includes('relation "predictions" does not exist')) {
      return NextResponse.json({
        predictions: [],
        message: "Predictions table doesn't exist yet. Please run migration.",
      })
    }

    return NextResponse.json(
      {
        message: "An error occurred",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
