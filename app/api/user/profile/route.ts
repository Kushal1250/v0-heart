import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyJwtToken } from "@/lib/token"

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract and verify the token
    const token = authHeader.split(" ")[1]
    const payload = await verifyJwtToken(token)
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to the database
    const sql = neon(process.env.DATABASE_URL)

    // Get the user profile
    const user = await sql`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        address, 
        occupation, 
        birthdate, 
        bio, 
        emergency_contact as "emergencyContact", 
        emergency_phone as "emergencyPhone",
        profile_picture as "profileImage"
      FROM users 
      WHERE id = ${payload.userId}
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user[0])
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
