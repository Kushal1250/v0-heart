import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { neon } from "@neondatabase/serverless"
import { randomBytes } from "crypto"

// Function to generate a secure token
function generateSecureToken() {
  return randomBytes(32).toString("hex")
}

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json()

    if (!identifier || !code) {
      return NextResponse.json({ message: "Email and verification code are required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Get user by email
    let user
    try {
      user = await getUserByEmail(identifier)

      if (!user) {
        return NextResponse.json({ message: "Invalid verification code" }, { status: 400 })
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      return NextResponse.json({ message: "Database error" }, { status: 500 })
    }

    // Verify the code
    try {
      const verificationResult = await sql`
        SELECT * FROM verification_codes
        WHERE user_id = ${user.id}
        AND code = ${code}
        AND type = 'password_reset'
        AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `

      if (verificationResult.length === 0) {
        return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 })
      }

      // Generate a reset token
      const token = generateSecureToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

      // Check if password_reset_tokens table exists
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'password_reset_tokens'
        );
      `

      // Create table if it doesn't exist
      if (!tableExists[0].exists) {
        await sql`
          CREATE TABLE password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      }

      // Store the token
      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, ${expiresAt})
      `

      // Delete the used verification code
      await sql`
        DELETE FROM verification_codes
        WHERE id = ${verificationResult[0].id}
      `

      return NextResponse.json({
        success: true,
        token,
      })
    } catch (error) {
      console.error("Error verifying code:", error)
      return NextResponse.json({ message: "Failed to verify code" }, { status: 500 })
    }
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
