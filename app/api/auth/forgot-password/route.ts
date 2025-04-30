import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone } from "@/lib/db"
import { createPasswordResetToken } from "@/lib/token"
import { isValidEmail } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email-utils"
import { sendPasswordResetSMS } from "@/lib/sms-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    const { email, phone, method } = await request.json()

    // Validate input based on method
    if (method === "email") {
      if (!email) {
        return NextResponse.json({ message: "Email is required" }, { status: 400 })
      }

      if (!isValidEmail(email)) {
        return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
      }
    } else if (method === "sms") {
      if (!phone) {
        return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ message: "Invalid reset method" }, { status: 400 })
    }

    // Find user based on method
    let user
    try {
      if (method === "email") {
        console.log(`Processing password reset request for email: ${email}`)
        user = await getUserByEmail(email)
      } else {
        console.log(`Processing password reset request for phone: ${phone}`)
        user = await getUserByPhone(phone)
      }
    } catch (dbError) {
      console.error("Database error when fetching user:", dbError)
      await logError("forgotPassword_fetchUser", dbError, { email, phone, method })
      return NextResponse.json(
        {
          message: "Unable to connect to the database. Please try again later.",
        },
        { status: 500 },
      )
    }

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log(
        `No user found with ${method === "email" ? "email" : "phone"}: ${method === "email" ? email : phone}, but returning success message`,
      )
      return NextResponse.json({
        message: `If an account exists with this ${method === "email" ? "email" : "phone number"}, a reset link has been sent`,
      })
    }

    try {
      // Generate token and create reset token
      console.log(`Creating password reset token for user: ${user.id}`)

      // Use the createPasswordResetToken function from token.ts
      const { token, expires } = await createPasswordResetToken(user.id)

      // Generate reset link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      console.log(`Reset link: ${resetLink}`)

      // Send reset instructions based on method
      let sendResult
      if (method === "email") {
        sendResult = await sendPasswordResetEmail(user.email, token, user.name)
        console.log("Email send result:", sendResult)
      } else {
        sendResult = await sendPasswordResetSMS(user.phone, token)
        console.log("SMS send result:", sendResult)
      }

      return NextResponse.json({
        message: `If an account exists with this ${method === "email" ? "email" : "phone number"}, a reset link has been sent`,
        // Include previewUrl in development environment
        ...(process.env.NODE_ENV === "development"
          ? {
              previewUrl: resetLink,
            }
          : {}),
      })
    } catch (tokenError) {
      console.error("Error creating password reset token:", tokenError)
      await logError("forgotPassword_createToken", tokenError, { userId: user.id })
      return NextResponse.json(
        {
          message: "Failed to create reset token. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Password reset request error:", error)
    await logError("forgotPassword_general", error)
    return NextResponse.json(
      {
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
