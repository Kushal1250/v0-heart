import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { getUserById, updateUserPassword, comparePasswords } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set")
      return NextResponse.json(
        { message: "Database connection error: No database connection string was provided" },
        { status: 500 },
      )
    }

    // Get the current user
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      console.log("No authenticated user found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 })
    }

    // Get full user data with password
    const user = await getUserById(currentUser.id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await comparePasswords(currentPassword, user.password)

    if (!isPasswordValid) {
      console.log("Invalid current password")
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    // Update password
    await updateUserPassword(user.id, newPassword)

    console.log("Password updated successfully for user:", user.id)
    return NextResponse.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Error changing password:", error)

    // Check if the error is related to database connection
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    if (errorMessage.includes("database connection") || errorMessage.includes("neon")) {
      return NextResponse.json({ message: "Database connection error: Please try again later" }, { status: 503 })
    }

    return NextResponse.json({ message: "An error occurred while changing your password" }, { status: 500 })
  }
}
