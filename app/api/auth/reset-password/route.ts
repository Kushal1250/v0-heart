import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { hashPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password, code } = await request.json()

    if (!email || !password || !code) {
      return NextResponse.json({ message: "Email, password, and verification code are required" }, { status: 400 })
    }

    // Connect to the database
    const sql = neon(process.env.DATABASE_URL)

    // Check if the user exists
    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify the code (this should be done in a transaction ideally)
    const codes = await sql`
      SELECT * FROM verification_codes 
      WHERE identifier = ${email} AND code = ${code} AND expires_at > NOW()
    `

    if (codes.length === 0) {
      return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password)

    // Update the user's password
    await sql`UPDATE users SET password = ${hashedPassword}, updated_at = NOW() WHERE email = ${email}`

    // Delete the verification code
    await sql`DELETE FROM verification_codes WHERE identifier = ${email}`

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ message: "An error occurred while resetting your password" }, { status: 500 })
  }
}
