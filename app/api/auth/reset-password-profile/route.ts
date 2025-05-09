import { NextResponse } from "next/server"
import { updateUserPassword } from "@/lib/db"
import { isStrongPassword, getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Validate input
    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 })
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Get the current user from the session
    const user = await getUserFromRequest(request as any)

    if (!user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Update password
    await updateUserPassword(user.id, password)

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
