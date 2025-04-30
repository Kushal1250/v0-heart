import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { isValidEmail } from "@/lib/auth-utils"
import { sendEmailWithCode } from "@/lib/email-utils"
import { createVerificationCode } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, purpose } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

    // Find user by email
    let user
    try {
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
        message: "If an account exists with this email, a verification code has been sent",
      })
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    try {
      // Save the code to the database
      await createVerificationCode(user.id, code)

      // Send the code via email
      const emailSubject = purpose === "password-reset" ? "Reset Your Password" : "Verification Code"

      const emailText =
        purpose === "password-reset"
          ? `Your password reset code is: ${code}. This code will expire in 15 minutes.`
          : `Your verification code is: ${code}. This code will expire in 15 minutes.`

      await sendEmailWithCode(email, emailSubject, code, user.name)

      return NextResponse.json({
        message: "If an account exists with this email, a verification code has been sent",
        // Include code in development environment for testing
        ...(process.env.NODE_ENV === "development" ? { previewCode: code } : {}),
      })
    } catch (error) {
      console.error("Error creating or sending verification code:", error)
      return NextResponse.json({ message: "Failed to send verification code. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Verification code request error:", error)
    return NextResponse.json({ message: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
