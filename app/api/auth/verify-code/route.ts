import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserByEmail } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json()

    if (!identifier || !code) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifier and verification code are required",
        },
        { status: 400 },
      )
    }

    console.log(`Verifying code for identifier: ${identifier}, code: ${code}`)

    // First, check if the verification_codes table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      );
    `

    if (!tableExists[0].exists) {
      console.log("verification_codes table doesn't exist")
      return NextResponse.json(
        {
          success: false,
          message: "Verification system is not set up properly",
        },
        { status: 500 },
      )
    }

    // Get user ID if identifier is an email
    let userId = identifier
    if (identifier.includes("@")) {
      const user = await getUserByEmail(identifier)
      if (user) {
        userId = user.id
        console.log(`Found user ID ${userId} for email ${identifier}`)
      }
    }

    // Check both the identifier and user ID for the verification code
    const verificationCodes = await sql`
      SELECT * FROM verification_codes
      WHERE (user_id = ${identifier} OR user_id = ${userId})
      AND code = ${code}
      AND expires_at > NOW()
    `

    console.log(`Found ${verificationCodes.length} verification codes`)

    if (verificationCodes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code not found or expired. Please request a new code.",
        },
        { status: 400 },
      )
    }

    // Code is valid, mark it as verified by deleting it
    await sql`DELETE FROM verification_codes WHERE id = ${verificationCodes[0].id}`

    // Return success
    return NextResponse.json({
      success: true,
      message: "Verification successful",
      userId: userId,
    })
  } catch (error) {
    console.error("Error verifying code:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during verification",
      },
      { status: 500 },
    )
  }
}
