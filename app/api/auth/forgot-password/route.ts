import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { createSimpleResetToken } from "@/lib/simple-token"
import { isValidEmail } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email-utils"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log(`Password reset request received - Email: ${email}`)

    // Validate email
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

    // Find user by email
    let user
    try {
      console.log(`Looking up user by email: ${email}`)
      user = await getUserByEmail(email)
    } catch (dbError) {
      console.error("Database error when fetching user:", dbError)
      return NextResponse.json(
        { message: "Unable to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log(`No user found with email: ${email}`)
      return NextResponse.json({
        message: "If an account exists with this email, a reset link has been sent",
      })
    }

    try {
      console.log(`Creating password reset token for user: ${user.id}`)

      // Use the simple token creation function
      const { token, expires } = await createSimpleResetToken(user.id)

      // Generate reset link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      console.log(`Reset link generated: ${resetLink}`)

      // Send reset instructions via email
      await sendPasswordResetEmail(user.email, resetLink, user.name)
      console.log(`Reset email sent to: ${user.email}`)

      return NextResponse.json({
        message: "If an account exists with this email, a reset link has been sent",
        // Include previewUrl in development environment
        ...(process.env.NODE_ENV === "development" ? { previewUrl: resetLink } : {}),
      })
    } catch (tokenError) {
      console.error("Error creating or sending password reset token:", tokenError)
      return NextResponse.json({ message: "Failed to create reset token. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ message: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
