import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getSession } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 })
    }

    // Check if the verification code exists and is valid
    const result = await sql`
      SELECT * FROM verification_codes
      WHERE user_id = ${session.user.id}
        AND code = ${code}
        AND expires_at > NOW()
        AND type = 'phone_verification'
        AND used = false
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 })
    }

    // Mark the verification code as used
    await sql`
      UPDATE verification_codes
      SET used = true
      WHERE id = ${result.rows[0].id}
    `

    // Update the user's phone verification status
    await sql`
      UPDATE users
      SET phone_verified = true
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying phone:", error)
    return NextResponse.json({ message: "Failed to verify phone" }, { status: 500 })
  }
}
