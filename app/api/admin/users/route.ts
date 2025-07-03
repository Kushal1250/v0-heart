import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    // Check admin authentication
    const cookies = headers().get("cookie") || ""
    const isAdminCookie = cookies.split(";").find((cookie) => cookie.trim().startsWith("is_admin="))
    const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Fetch all users including their passwords (for admin view only)
    const users = await sql`
      SELECT 
        id, 
        email, 
        name, 
        password,
        role, 
        created_at, 
        provider,
        phone,
        profile_picture
      FROM users 
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        ...user,
        created_at: user.created_at.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
