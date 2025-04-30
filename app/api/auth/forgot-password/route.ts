import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { isValidEmail } from "@/lib/auth-utils"
import { sendPasswordResetEmail } from "@/lib/email-utils"
import { neon } from "@neondatabase/serverless"

// Function to generate a random 6-digit code
function generateVerificationCode() {
  // Generate a random number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Function to store verification code in database
async function storeVerificationCode(userId: number, code: string, expiresAt: Date) {
  const sql = neon(process.env.DATABASE_URL!)

  try {
    // Check if verification_codes table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      );
    `

    // Create table if it doesn't exist
    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE verification_codes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          code VARCHAR(10) NOT NULL,
          type VARCHAR(20) NOT NULL DEFAULT 'password_reset',
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    }

    // Delete any existing codes for this user
    await sql`
      DELETE FROM verification_codes 
      WHERE user_id = ${userId} AND type = 'password_reset'
    `

    // Insert new code
    await sql`
      INSERT INTO verification_codes (user_id, code, expires_at, type)
      VALUES (${userId}, ${code}, ${expiresAt}, 'password_reset')
    `

    return true
  } catch (error) {
    console.error("Error storing verification code:", error)
    return false
  }
}

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
        message: "If an account exists with this email, a verification code has been sent",
      })
    }

    try {
      // Generate a verification code
      const verificationCode = generateVerificationCode()

      // Set expiration time (30 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

      // Store the code in the database
      const stored = await storeVerificationCode(user.id, verificationCode, expiresAt)

      if (!stored) {
        throw new Error("Failed to store verification code")
      }

      // Send verification code via email
      await sendPasswordResetEmail(user.email, verificationCode, user.name)
      console.log(`Verification code sent to: ${user.email}`)

      return NextResponse.json({
        message: "If an account exists with this email, a verification code has been sent",
      })
    } catch (error) {
      console.error("Error creating or sending verification code:", error)
      return NextResponse.json({ message: "Failed to send verification code. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ message: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
