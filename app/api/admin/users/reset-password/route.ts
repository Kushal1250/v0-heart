import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const cookies = request.cookies
    const isAdmin = cookies.get("is_admin")?.value === "true"

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: "User ID and email are required" }, { status: 400 })
    }

    // Connect to database
    const sql = neon(process.env.DATABASE_URL!)

    // Check if user exists
    const user = await sql`SELECT id FROM users WHERE id = ${userId} AND email = ${email}`

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate a reset token
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token valid for 24 hours

    // Store token in database
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    `

    // In a real application, you would send an email with the reset link
    // For this example, we'll just return a success message with the token
    // In production, you should use a proper email service

    // Construct reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://heartguide3.vercel.app"}/reset-password?token=${token}`

    // Send email logic would go here
    // For now, we'll just log the URL and return it in the response
    console.log(`Password reset URL: ${resetUrl}`)

    // If email service is configured, send the email
    if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
      try {
        // Email sending logic would go here
        // This is a placeholder for actual email sending code
        console.log(`Email would be sent to ${email} with reset link: ${resetUrl}`)
      } catch (emailError) {
        console.error("Failed to send email:", emailError)
        // Continue execution even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link generated. In a production environment, this would be emailed to the user.",
      // Only include token in development for testing purposes
      ...(process.env.NODE_ENV === "development" && { token, resetUrl }),
    })
  } catch (error) {
    console.error("Error in reset password API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
