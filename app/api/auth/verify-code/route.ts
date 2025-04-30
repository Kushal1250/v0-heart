import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserByEmail, getUserByPhone } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json()

    if (!identifier || !code) {
      return NextResponse.json(
        { success: false, message: "Identifier and verification code are required" },
        { status: 400 },
      )
    }

    console.log(`Verifying code ${code} for identifier ${identifier}`)

    // Get user ID if identifier is an email or phone
    let userId = identifier
    let user = null

    if (identifier.includes("@")) {
      user = await getUserByEmail(identifier)
    } else {
      // Try to get user by phone
      user = await getUserByPhone(identifier)
    }

    if (user) {
      userId = user.id
      console.log(`Found user ID ${userId} for identifier ${identifier}`)
    } else {
      console.log(`No user found for identifier ${identifier}`)
      return NextResponse.json(
        { success: false, message: "User not found. Please check your email and try again." },
        { status: 404 },
      )
    }

    // Check if the verification_codes table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      );
    `

    if (!tableExists[0].exists) {
      console.log("verification_codes table doesn't exist")
      return NextResponse.json(
        { success: false, message: "Verification code not found or expired. Please request a new code." },
        { status: 404 },
      )
    }

    // Try to find the code for either the identifier or the user ID
    const verificationCodes = await sql`
      SELECT * FROM verification_codes
      WHERE (user_id = ${identifier} OR user_id = ${userId})
      AND code = ${code}
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `

    console.log(`Found ${verificationCodes.length} matching verification codes`)

    if (verificationCodes.length === 0) {
      return NextResponse.json(
        { success: false, message: "Verification code not found or expired. Please request a new code." },
        { status: 404 },
      )
    }

    const verificationCode = verificationCodes[0]
    console.log("Verification code found:", verificationCode)

    // Delete the used code
    await sql`DELETE FROM verification_codes WHERE id = ${verificationCode.id}`
    console.log(`Deleted verification code ${verificationCode.id}`)

    // Generate a token for password reset
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    try {
      // Check if password_reset_tokens table exists
      const resetTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'password_reset_tokens'
        );
      `

      if (!resetTableExists[0].exists) {
        console.log("Creating password_reset_tokens table")
        await sql`
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            is_valid BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `
      }

      // Store the token in the database
      await sql`
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
        VALUES (${crypto.randomUUID()}, ${userId}, ${token}, ${expiresAt})
      `

      console.log(`Created password reset token for user ${userId}`)
    } catch (error) {
      console.error("Error creating password reset token:", error)
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred while creating the password reset token",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification successful",
      token,
    })
  } catch (error) {
    console.error("Error verifying code:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while verifying the code",
      },
      { status: 500 },
    )
  }
}
