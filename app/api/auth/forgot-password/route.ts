import { NextResponse } from "next/server"
import { getUserByEmail, createVerificationCode } from "@/lib/db"
import { isValidEmail } from "@/lib/auth-utils"
import { sendEmail } from "@/lib/email-utils"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log(`[v0] Password reset request received - Email: ${email}`)

    // Validate email
    if (!email) {
      console.warn("[v0] Email not provided in password reset request")
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      console.warn(`[v0] Invalid email format: ${email}`)
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

    // Find user by email
    let user
    try {
      console.log(`[v0] Looking up user by email: ${email}`)
      user = await getUserByEmail(email)
    } catch (dbError) {
      console.error("[v0] Database error when fetching user:", dbError)
      return NextResponse.json(
        { message: "Unable to connect to the database. Please try again later." },
        { status: 500 },
      )
    }

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      console.log(`[v0] No user found with email: ${email}`)
      return NextResponse.json({
        message: "If an account exists with this email, a verification code has been sent",
      })
    }

    console.log(`[v0] User found: ${user.id} (${user.email})`)

    try {
      // Generate a 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      console.log(`[v0] Generated verification code for user ${user.id}`)

      // Store the code in the database
      console.log(`[v0] Attempting to create verification code in database...`)
      await createVerificationCode(user.id, verificationCode)
      console.log(`[v0] Verification code stored successfully`)

      // Create email content
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
              <p>Hello ${user.name || "there"},</p>
              <p>We received a request to reset your password. Please use the following code to verify your identity:</p>
              <div class="code">${verificationCode}</div>
              <p>This code will expire in 15 minutes for security reasons.</p>
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
        
        Hello ${user.name || "there"},
        
        We received a request to reset your password. Please use the following code to verify your identity:
        
        ${verificationCode}
        
        This code will expire in 15 minutes for security reasons.
        
        If you didn't request a password reset, you can ignore this email.
        
        This is an automated message, please do not reply to this email.
      `

      // Send the email directly using the sendEmail function from email-utils
      console.log(`[v0] Sending verification code email to: ${user.email}`)
      const emailResult = await sendEmail(user.email, subject, html, text)

      if (!emailResult.success) {
        console.error("[v0] Failed to send email:", emailResult)
        return NextResponse.json({ message: "Failed to send verification code. Please try again." }, { status: 500 })
      }

      console.log(`[v0] Verification code email sent successfully to: ${user.email}`)

      return NextResponse.json({
        message: "If an account exists with this email, a verification code has been sent",
        // Include previewCode in development environment for testing
        ...(process.env.NODE_ENV === "development" ? { previewCode: verificationCode } : {}),
      })
    } catch (error) {
      console.error("[v0] Error creating or sending verification code:", error)
      return NextResponse.json({ message: "Failed to send verification code. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Password reset request error:", error)
    return NextResponse.json({ message: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
