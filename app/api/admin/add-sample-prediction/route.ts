import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const isAdmin = cookies().get("is_admin")?.value === "true"

    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, result, predictionData } = body

    if (!userId || result === undefined) {
      return NextResponse.json(
        { message: "Missing required fields", error: "userId and result are required" },
        { status: 400 },
      )
    }

    // Check if user exists
    const userCheck = await sql`SELECT id FROM users WHERE id = ${userId}`

    if (userCheck.length === 0) {
      return NextResponse.json(
        { message: "User not found", error: "The specified user does not exist" },
        { status: 404 },
      )
    }

    // Check if predictions table exists, create it if it doesn't
    try {
      await sql`
        SELECT 1 FROM predictions LIMIT 1
      `
    } catch (error) {
      // Table doesn't exist, create it
      await sql`
        CREATE TABLE IF NOT EXISTS predictions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          result NUMERIC NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          prediction_data JSONB
        )
      `
    }

    // Insert the sample prediction
    const predictionId = uuidv4()

    await sql`
      INSERT INTO predictions (id, user_id, result, prediction_data)
      VALUES (${predictionId}, ${userId}, ${result}, ${JSON.stringify(predictionData)})
    `

    return NextResponse.json({
      success: true,
      message: "Sample prediction added successfully",
      predictionId,
    })
  } catch (error) {
    console.error("Error adding sample prediction:", error)
    return NextResponse.json(
      {
        message: "An error occurred",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
