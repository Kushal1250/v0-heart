import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { isValidEmail } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email-utils"
import { v4 as uuidv4 } from "uuid"

// Simple function to create a reset token directly in the database
async function createDirectResetToken(userId: string) {
  const { sql } = await import("@vercel/postgres")

  try {
    // Generate a unique token
    const token = uuidv4()

    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // First, try to create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `.catch((err) => {
      console.error("Error creating password_reset_tokens table:", err)
      // Continue even if table creation fails (it might already exist)
    })

    // Insert the new token
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt})
    `

    return { token, expires: expiresAt }
  } catch (error) {
    console.error("Error creating reset token:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log(`Password reset request received for email: ${email}`)

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

      // Create token directly in the database
      const { token, expires } = await createDirectResetToken(user.id)

      // Generate reset link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      console.log(`Reset link generated: ${resetLink}`)

      // Send reset email
      const emailResult = await sendPasswordResetEmail(user.email, resetLink, user.name)
      console.log(`Reset email sent to: ${user.email}, result:`, emailResult)

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
