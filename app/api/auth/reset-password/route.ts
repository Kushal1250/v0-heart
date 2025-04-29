import { NextResponse } from "next/server"
import { getUserByEmail, updateUserPassword } from "@/lib/db"
import { isValidEmail, isStrongPassword } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { identifier, newPassword } = await request.json()

    // Validate inputs
    if (!identifier) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    if (!newPassword) {
      return NextResponse.json({ message: "New password is required" }, { status: 400 })
    }

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters with uppercase, lowercase, and numbers" },
        { status: 400 },
      )
    }

    // Get the user
    let user
    if (isValidEmail(identifier)) {
      user = await getUserByEmail(identifier)
    } else {
      // Handle phone number case if needed
      return NextResponse.json({ message: "Phone verification not supported yet" }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update the password
    await updateUserPassword(user.id, newPassword)

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
