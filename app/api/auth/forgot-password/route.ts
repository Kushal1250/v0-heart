import { NextResponse } from "next/server"
import { getUserByEmail, createPasswordResetToken } from "@/lib/db"
import { generateToken, isValidEmail } from "@/lib/auth-utils"
import { sendEmail } from "@/lib/email-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 })
    }

    console.log(`Processing password reset request for email: ${email}`)

    // Check if user exists
    const user = await getUserByEmail(email)

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log(`User not found for email: ${email}, but returning success for security`)
      return NextResponse.json({ message: "If an account exists, a reset link has been sent" })
    }

    // Generate token and expiration
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Save token to database
    await createPasswordResetToken(user.id, token, expiresAt)

    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`

    const result = await sendEmail({
      to: email,
      subject: "Reset Your Password",
      text: `Click the following link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
    })

    if (!result.success) {
      console.error("Failed to send password reset email:", result.message)
      return NextResponse.json({ message: "Failed to send password reset email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent",
      previewUrl: result.previewUrl,
    })
  } catch (error) {
    await logError("forgot-password", error)
    console.error("Password reset request error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
