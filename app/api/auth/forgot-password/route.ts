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

    console.log(`Processing password reset request for email: ${email}`)

    // Check if user exists
    let user
    try {
      user = await getUserByEmail(email)
    } catch (dbError) {
      console.error("Database error when fetching user:", dbError)
      return NextResponse.json(
        {
          message: "Unable to connect to the database. Please try again later.",
        },
        { status: 500 },
      )
    }

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log(`No user found with email: ${email}, but returning success message`)
      return NextResponse.json({
        message: "If an account exists with this email, a reset link has been sent",
      })
    }

    try {
      // Generate token and expiration
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

      console.log(`Creating password reset token for user: ${user.id}`)

      // Save token to database
      await createPasswordResetToken(user.id, token, expiresAt)

      // In a real application, send email with reset link
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
    } catch (tokenError) {
      console.error("Error creating password reset token:", tokenError)
      return NextResponse.json(
        {
          message: "Failed to create reset token. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Password reset request error:", error)
    return NextResponse.json(
      {
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
