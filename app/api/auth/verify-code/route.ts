import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserByEmail } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json()

    if (!identifier || !code) {
      return NextResponse.json({ success: false, message: "Email and verification code are required" }, { status: 400 })
    }

    console.log(`Verifying code ${code} for identifier ${identifier}`)

    // Get user ID if identifier is an email
    let userId = identifier
    let user = null

    if (identifier.includes("@")) {
      user = await getUserByEmail(identifier)
      if (user) {
        userId = user.id
        console.log(`Found user ID ${userId} for email ${identifier}`)
      } else {
        console.log(`No user found for email ${identifier}`)
        return NextResponse.json({ success: false, message: "User not found with this email address" }, { status: 404 })
      }
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
        { success: false, message: "Verification system is currently unavailable. Please try again later." },
        { status: 500 },
      )
    }

    // Try to find the code for the user ID
    const verificationCodes = await sql`
      SELECT * FROM verification_codes
      WHERE user_id = ${userId}
      AND code = ${code}
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `

    console.log(`Found ${verificationCodes.length} matching verification codes`)

    if (verificationCodes.length === 0) {
      return NextResponse.json({ success: false, message: "Verification code not found or expired" }, { status: 404 })
    }

    const verificationCode = verificationCodes[0]
    console.log("Verification code found:", verificationCode)

    // Delete the used code
    await sql`DELETE FROM verification_codes WHERE id = ${verificationCode.id}`
    console.log(`Deleted verification code ${verificationCode.id}`)

    // Generate a token for password reset
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store the token in the database
    await sql`
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES (${crypto.randomUUID()}, ${userId}, ${token}, ${expiresAt})
    `

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
        message: "An error occurred while verifying the code. Please try again.",
      },
      { status: 500 },
    )
  }
}
