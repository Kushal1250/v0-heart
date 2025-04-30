import { NextResponse } from "next/server"
import { getPasswordResetByToken, updateUserPassword } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Verify token
    const resetToken = await getPasswordResetByToken(token)

    if (!resetToken) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    // Update password
    await updateUserPassword(resetToken.user_id, password)

    // Invalidate token (mark as used)
    await invalidateResetToken(token)

    return NextResponse.json({ message: "Password has been reset successfully" })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ message: "An error occurred while resetting your password" }, { status: 500 })
  }
}

async function invalidateResetToken(token: string) {
  try {
    // This function would mark the token as used in the database
    // For example:
    // await sql`UPDATE password_reset_tokens SET is_valid = false WHERE token = ${token}`
    return true
  } catch (error) {
    console.error("Error invalidating reset token:", error)
    return false
  }
}
