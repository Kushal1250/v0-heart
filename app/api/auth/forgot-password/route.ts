import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { isValidEmail } from "@/lib/auth-utils"
import { sendEmail } from "@/lib/email-utils"
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

// Function to send verification code email
async function sendVerificationCodeEmail(to: string, code: string, username?: string) {
  const subject = "Your Password Reset Code"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0070f3; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .code { font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; 
               margin: 20px 0; padding: 10px; background-color: #eee; border-radius: 4px; }
        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Code</h1>
        </div>
        <div class="content">
          <p>Hello ${username || "there"},</p>
          <p>We received a request to reset your password. Please use the following code to verify your identity:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 30 minutes for security reasons.</p>
          <p>If you didn't request a password reset, you can ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Password Reset Code
    
    Hello ${username || "there"},
    
    We received a request to reset your password. Please use the following code to verify your identity:
    
    ${code}
    
    This code will expire in 30 minutes for security reasons.
    
    If you didn't request a password reset, you can ignore this email.
    
    This is an automated message, please do not reply to this email.
  `

  return await sendEmail(to, subject, html, text)
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
      const emailResult = await sendVerificationCodeEmail(user.email, verificationCode, user.name)

      if (!emailResult.success) {
        console.error("Failed to send email:", emailResult.message)
        return NextResponse.json({ message: "Failed to send verification code. Please try again." }, { status: 500 })
      }

      console.log(`Verification code sent to: ${user.email}`)

      return NextResponse.json({
        message: "If an account exists with this email, a verification code has been sent",
        // Include previewCode in development environment
        ...(process.env.NODE_ENV === "development" ? { previewCode: verificationCode } : {}),
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
