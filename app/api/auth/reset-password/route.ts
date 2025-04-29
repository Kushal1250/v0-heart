import { NextResponse } from "next/server"
import { getPasswordResetByToken, updateUserPassword, deletePasswordReset } from "@/lib/db"
import { isStrongPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    // Validate input
    if (!token || !password) {
      return NextResponse.json({ message: "Token and password are required" }, { status: 400 })
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Verify token
    const resetRecord = await getPasswordResetByToken(token)
    if (!resetRecord) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    // Update password
    await updateUserPassword(resetRecord.user_id, password)

    // Delete used token
    await deletePasswordReset(token)

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
