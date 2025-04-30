import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserByEmail } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email-utils"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, isLoggedIn = false } = body

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Get user by email
    const user = await getUserByEmail(email)

    if (!user && !isLoggedIn) {
      // For security reasons, don't reveal that the user doesn't exist
      // Instead, pretend we sent the code
      return NextResponse.json({
        success: true,
        message: "If this email exists in our system, a verification code has been sent.",
      })
    }

    const userId = user?.id || email

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Check if the verification_codes table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      );
    `

    if (!tableExists[0].exists) {
      // Create the verification_codes table if it doesn't exist
      await sql`
        CREATE TABLE verification_codes (
          id UUID PRIMARY KEY,
          user_id TEXT NOT NULL,
          code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        );
      `
    }

    // Delete any existing codes for this user
    await sql`DELETE FROM verification_codes WHERE user_id = ${userId}`

    // Insert the new code
    await sql`
      INSERT INTO verification_codes (id, user_id, code, expires_at)
      VALUES (${crypto.randomUUID()}, ${userId}, ${code}, ${expiresAt})
    `

    // Send the verification code via email
    const emailResult = await sendVerificationEmail(email, code)

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send verification code. Please try again later.",
          error: emailResult.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      previewUrl: emailResult.previewUrl || null,
    })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while sending the verification code. Please try again.",
      },
      { status: 500 },
    )
  }
}
