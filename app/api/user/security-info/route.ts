import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@neondatabase/serverless"
import { getSessionToken, getUserFromSession } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const sessionToken = getSessionToken()
    const user = await getUserFromSession(sessionToken)

    if (!user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Fetch the user's security information
    const result = await sql`
      SELECT 
        COALESCE(email_verified, true) AS "emailVerified", 
        COALESCE(phone_verified, false) AS "phoneVerified",   true) AS "emailVerified", 
        COALESCE(phone_verified, false) AS "phoneVerified", 
        COALESCE(two_factor_enabled, false) AS "twoFactorEnabled",
        COALESCE(two_factor_method, 'sms') AS "twoFactorMethod"
      FROM users
      WHERE id = ${user.id}
    `

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching security info:", error)
    return NextResponse.json({ message: "Failed to fetch security information" }, { status: 500 })
  }
}
