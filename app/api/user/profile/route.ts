import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session or cookie
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract user ID from token or session
    // This is a simplified example - you should properly decode and verify the token
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

    // Query the database for user profile
    const { rows } = await sql`
      SELECT id, name, email, phone, profile_picture as "profilePicture", role, created_at as "createdAt"
      FROM users
      WHERE id = ${userId}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract user ID from token
    let userId
    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]))
      userId = tokenData.userId || tokenData.id
    } catch (e) {
      console.error("Error parsing token:", e)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID not found in token" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { name, email, phone } = body

    // Validate input
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Update user profile
    const { rows } = await sql`
      UPDATE users
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone || null},
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, phone, profile_picture as "profilePicture", role, created_at as "createdAt"
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
