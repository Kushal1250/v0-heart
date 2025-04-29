import { NextResponse } from "next/server"
import { verifyPasswordResetToken } from "@/lib/token"
import { updateUserPassword } from "@/lib/db"

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

    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ message: "Token and new password are required" }, { status: 400 })
    }

    // Verify the token
    const userId = await verifyPasswordResetToken(token)

    if (!userId) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    // Update the password
    await updateUserPassword(userId, newPassword)

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Error resetting password:", error)

    // Check if the error is related to database connection
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    if (errorMessage.includes("database connection") || errorMessage.includes("neon")) {
      return NextResponse.json({ message: "Database connection error: Please try again later" }, { status: 503 })
    }

    return NextResponse.json({ message: "An error occurred while resetting your password" }, { status: 500 })
  }
}
