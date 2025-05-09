import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyJwtToken } from "@/lib/token"

export async function POST(request: Request) {
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

    // Get the request body
    const body = await request.json()
    const { name, email, phone, address, occupation, birthdate, bio, emergencyContact, emergencyPhone } = body

    // Connect to the database
    const sql = neon(process.env.DATABASE_URL)

    // Update the user profile
    await sql`
      UPDATE users
      SET 
        name = ${name || null},
        phone = ${phone || null},
        address = ${address || null},
        occupation = ${occupation || null},
        birthdate = ${birthdate || null},
        bio = ${bio || null},
        emergency_contact = ${emergencyContact || null},
        emergency_phone = ${emergencyPhone || null}
      WHERE id = ${payload.userId}
    `

    // If email is being changed, we might want to verify it first
    if (email) {
      // Check if email is different from current email
      const currentUser = await sql`SELECT email FROM users WHERE id = ${payload.userId}`
      if (currentUser.length > 0 && currentUser[0].email !== email) {
        // Here you would typically send a verification email
        // For now, we'll just update it directly
        await sql`UPDATE users SET email = ${email} WHERE id = ${payload.userId}`
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
