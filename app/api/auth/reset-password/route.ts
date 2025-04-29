import { NextResponse } from "next/server"
import { getPasswordResetByToken, updateUserPassword, deletePasswordReset } from "@/lib/db"
import { isStrongPassword } from "@/lib/auth-utils"
import { getUserById } from "@/lib/db" // Assuming you have a getUserById function
import { verifyPasswordResetToken, invalidatePasswordResetToken } from "@/lib/token"

export async function POST(request: Request) {
  try {
    const { token, password: newPassword } = await request.json()

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    if (!isStrongPassword(newPassword)) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    // If token is provided, verify it
    if (token) {
      const userId = await verifyPasswordResetToken(token)
      if (!userId) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
      }

      // After successful password change, invalidate the token
      await invalidatePasswordResetToken(token)

      // Rest of the token-based password reset logic...
    }

    // Verify token
    const resetRecord = await getPasswordResetByToken(token)
    if (!resetRecord) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    // Get the user
    const user = await getUserById(resetRecord.user_id)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update password
    await updateUserPassword(user.id, newPassword)

    // Delete used token
    await deletePasswordReset(token)

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
