import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const isAdmin = (await cookies()).get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Predictions API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50") // Increased default limit
    const search = url.searchParams.get("search") || ""

    const offset = (page - 1) * limit

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

    // Get total count for pagination
    const countQuery = search
      ? await sql`
          SELECT COUNT(*) 
          FROM predictions p
          JOIN users u ON p.user_id = u.id
          WHERE u.name ILIKE ${"%" + search + "%"} 
             OR u.email ILIKE ${"%" + search + "%"}
        `
      : await sql`SELECT COUNT(*) FROM predictions`

    const totalCount = Number.parseInt(countQuery[0].count)
    const totalPages = Math.ceil(totalCount / limit)

    // Fetch predictions with user information
    let predictions

    if (search) {
      predictions = await sql`
        SELECT p.*, u.name, u.email
        FROM predictions p
        JOIN users u ON p.user_id = u.id
        WHERE u.name ILIKE ${"%" + search + "%"} 
           OR u.email ILIKE ${"%" + search + "%"}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      predictions = await sql`
        SELECT p.*, u.name, u.email
        FROM predictions p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    // Transform the data to match the expected format
    const formattedPredictions = predictions.map((pred) => ({
      id: pred.id,
      userId: pred.user_id,
      userName: pred.name || pred.email || "Unknown User",
      result: Number.parseFloat(pred.result),
      timestamp: pred.created_at,
      data: pred.prediction_data || {},
    }))

    return NextResponse.json({
      predictions: formattedPredictions,
      pagination: {
        total: totalCount,
        pages: totalPages,
        page,
        limit,
      },
    })
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
