import { NextResponse } from "next/server"
import { getUserByEmail, createPasswordResetToken } from "@/lib/db"
import { generateToken, isValidEmail } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email).catch((err) => {
      console.error("Database error when fetching user:", err)
      throw new Error("Database connection error")
    })

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with this email, a reset link has been sent",
      })
    }

    try {
      // Generate token and expiration
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

      // Save token to database
      await createPasswordResetToken(user.id, token, expiresAt)

      // In a real application, send email with reset link
      // For this example, we'll just log it
      console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`)

      return NextResponse.json({
        message: "If an account exists with this email, a reset link has been sent",
        // Include previewUrl in development environment
        ...(process.env.NODE_ENV === "development"
          ? {
              previewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`,
            }
          : {}),
      })
    } catch (err) {
      console.error("Error creating password reset token:", err)
      throw new Error("Failed to create password reset token")
    }
  } catch (error: any) {
    console.error("Password reset request error:", error)

    // Provide more specific error messages based on the error type
    let errorMessage = "An unexpected error occurred"

    if (error.message === "Database connection error") {
      errorMessage = "Unable to connect to the database. Please try again later."
    } else if (error.message === "Failed to create password reset token") {
      errorMessage = "Failed to create reset token. Please try again."
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
