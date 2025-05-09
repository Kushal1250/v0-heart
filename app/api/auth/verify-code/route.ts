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
      // Use a simpler query to insert the token
      console.log(`Inserting token for user ${userId}`)

      // Use a more compatible approach for the token insertion
      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${userId}, ${token}, ${expiresAt})
      `

      console.log(`Created password reset token for user ${userId}`)
    } catch (error) {
      console.error("Error creating password reset token:", error)

      // Try an alternative approach if the first one fails
      try {
        console.log("Trying alternative token insertion approach")
        const tokenId = crypto.randomUUID()
        const expiresAtStr = expiresAt.toISOString()

        await sql`
          INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
          VALUES (${tokenId}, ${userId.toString()}, ${token}, ${expiresAtStr})
        `

        console.log("Alternative token insertion successful")
      } catch (altError) {
        console.error("Alternative token insertion also failed:", altError)
        return NextResponse.json(
          {
            success: false,
            message: "An error occurred while creating the password reset token",
          },
          { status: 500 },
        )
      }
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
