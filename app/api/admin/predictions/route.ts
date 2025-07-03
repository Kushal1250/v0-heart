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

    // Parse query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10") // Default to 10 for consistency with frontend
    const search = url.searchParams.get("search") || ""
    const riskFilter = url.searchParams.get("riskFilter") || "all"
    const dateFilter = url.searchParams.get("dateFilter") || "all"
    const sortOrder = url.searchParams.get("sortOrder") || "newest"

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

    // Build dynamic WHERE clause
    const whereClauses = []
    const queryParams: (string | number)[] = []
    let paramIndex = 1

    if (search) {
      whereClauses.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (riskFilter !== "all") {
      if (riskFilter === "high") {
        whereClauses.push(`p.result > $${paramIndex}`)
        queryParams.push(0.5)
        paramIndex++
      } else if (riskFilter === "medium") {
        whereClauses.push(`p.result >= $${paramIndex} AND p.result <= $${paramIndex + 1}`)
        queryParams.push(0.3, 0.5)
        paramIndex += 2
      } else if (riskFilter === "low") {
        whereClauses.push(`p.result < $${paramIndex}`)
        queryParams.push(0.3)
        paramIndex++
      }
    }

    if (dateFilter !== "all") {
      const now = new Date()
      let startDate: Date | null = null

      if (dateFilter === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      } else if (dateFilter === "week") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        startDate.setDate(startDate.getDate() - 7)
      } else if (dateFilter === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        startDate.setMonth(startDate.getMonth() - 1)
      }

      if (startDate) {
        whereClauses.push(`p.created_at >= $${paramIndex}`)
        queryParams.push(startDate.toISOString())
        paramIndex++
      }
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : ""

    // Get total count for pagination
    const countQuery = await sql.unsafe(
      `
      SELECT COUNT(*) 
      FROM predictions p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
    `,
      queryParams,
    )

    const totalCount = Number.parseInt(countQuery[0].count)
    const totalPages = Math.ceil(totalCount / limit)

    // Build dynamic ORDER BY clause
    let orderByClause = ""
    if (sortOrder === "newest") {
      orderByClause = "ORDER BY p.created_at DESC"
    } else if (sortOrder === "oldest") {
      orderByClause = "ORDER BY p.created_at ASC"
    } else if (sortOrder === "highest") {
      orderByClause = "ORDER BY p.result DESC"
    } else if (sortOrder === "lowest") {
      orderByClause = "ORDER BY p.result ASC"
    }

    // Fetch predictions with user information
    const predictions = await sql.unsafe(
      `
      SELECT p.*, u.name, u.email
      FROM predictions p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `,
      [...queryParams, limit, offset],
    )

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
