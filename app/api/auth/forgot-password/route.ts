import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { isValidEmail } from "@/lib/auth-utils"
import { sendVerificationCode } from "@/lib/auth-utils"

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

    // Send verification code via email
    const result = await sendVerificationCode(email, "email")

    // Return the result, including any preview URL for development
    return NextResponse.json({
      message: "If an account exists, a verification code has been sent",
      previewUrl: result.previewUrl,
    })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
