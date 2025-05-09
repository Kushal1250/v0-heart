import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyJwtToken } from "@/lib/token"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword, token } = await request.json()

    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    if (!newPassword) {
      return NextResponse.json({ message: "New password is required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Verify the token
    const payload = await verifyJwtToken(token)
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
    }

    // Connect to the database
    const sql = neon(process.env.DATABASE_URL)

    // Get the user
    const users = await sql`SELECT * FROM users WHERE id = ${payload.userId}`
    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update the password
    await sql`UPDATE users SET password = ${hashedPassword}, updated_at = NOW() WHERE id = ${user.id}`

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { message: "An error occurred while resetting your password. Please try again." },
      { status: 500 },
    )
  }
}
