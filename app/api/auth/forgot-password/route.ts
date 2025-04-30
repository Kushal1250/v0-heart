import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone, createPasswordResetToken } from "@/lib/db"
import { generateToken, isValidEmail } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email-utils"
import { sendPasswordResetSMS } from "@/lib/sms-utils"

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
    if (method === "email") {
      console.log(`Processing password reset request for email: ${email}`)
      user = await getUserByEmail(email)
    } else {
      console.log(`Processing password reset request for phone: ${phone}`)
      user = await getUserByPhone(phone)
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
      // Generate token and expiration
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

      console.log(`Creating password reset token for user: ${user.id}`)

      // Save token to database
      await createPasswordResetToken(user.id, token, expiresAt)

      // Send reset instructions based on method
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

      if (method === "email") {
        await sendPasswordResetEmail(user.email, resetLink)
      } else {
        await sendPasswordResetSMS(user.phone, resetLink)
      }

      console.log(`Reset link: ${resetLink}`)

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
