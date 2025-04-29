import { NextResponse } from "next/server"
import { getUserByEmail, createPasswordResetToken } from "@/lib/db"
import { generateToken, isValidEmail } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserByEmail(email)

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent" })
    }

    // Generate token and expiration
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Save token to database
    await createPasswordResetToken(user.id, token, expiresAt)

    // In a real application, send email with reset link
    // For this example, we'll just log it
    console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`)

    return NextResponse.json({ message: "If an account exists, a reset link has been sent" })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
