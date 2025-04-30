import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone } from "@/lib/db"
import { createSimpleResetToken } from "@/lib/simple-token"
import { isValidEmail } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email-utils"
import { sendPasswordResetSMS } from "@/lib/sms-utils"

export async function POST(request: Request) {
  try {
    const { email, phone, method } = await request.json()

    console.log(`Password reset request received - Method: ${method}, Email: ${email}, Phone: ${phone}`)

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
        console.log(`Looking up user by email: ${email}`)
        user = await getUserByEmail(email)
      } else {
        console.log(`Looking up user by phone: ${phone}`)
        user = await getUserByPhone(phone)
      }
    } catch (dbError) {
      console.error("Database error when fetching user:", dbError)
      return NextResponse.json(
        { message: "Unable to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log(`No user found with ${method === "email" ? "email" : "phone"}: ${method === "email" ? email : phone}`)
      return NextResponse.json({
        message: `If an account exists with this ${method === "email" ? "email" : "phone number"}, a reset link has been sent`,
      })
    }

    try {
      console.log(`Creating password reset token for user: ${user.id}`)

      // Use the simple token creation function
      const { token, expires } = await createSimpleResetToken(user.id)

      // Generate reset link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      console.log(`Reset link generated: ${resetLink}`)

      // Send reset instructions based on method
      if (method === "email") {
        await sendPasswordResetEmail(user.email, resetLink)
        console.log(`Reset email sent to: ${user.email}`)
      } else {
        await sendPasswordResetSMS(user.phone, resetLink)
        console.log(`Reset SMS sent to: ${user.phone}`)
      }

      return NextResponse.json({
        message: `If an account exists with this ${method === "email" ? "email" : "phone number"}, a reset link has been sent`,
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
