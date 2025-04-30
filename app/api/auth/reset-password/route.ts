import { NextResponse } from "next/server"
import { hash } from "bcrypt-ts"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const { sql } = await import("@vercel/postgres")

    // Get the token from the database
    const result = await sql`
      SELECT user_id, expires_at 
      FROM password_reset_tokens 
      WHERE token = ${token}
    `

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    const resetToken = result.rows[0]

    // Check if token has expired
    if (new Date() > new Date(resetToken.expires_at)) {
      return NextResponse.json({ message: "Token has expired" }, { status: 400 })
    }

    const userId = resetToken.user_id

    // Hash the new password
    const hashedPassword = await hash(password, 10)

    // Update the user's password
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE id = ${userId}
    `

    // Delete the used token
    await sql`
      DELETE FROM password_reset_tokens 
      WHERE token = ${token}
    `

    return NextResponse.json({ message: "Password has been reset successfully" })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ message: "An error occurred while resetting the password" }, { status: 500 })
  }
}
