import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract user ID from token
    let userId
    try {
      // Simple parsing for demonstration - in production use proper JWT verification
      const tokenData = JSON.parse(atob(token.split(".")[1]))
      userId = tokenData.userId || tokenData.id
    } catch (e) {
      console.error("Error parsing token:", e)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in token" }, { status: 401 })
    }

    // Query the database for user
    const { rows } = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE id = ${userId}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
