import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getSession } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await getSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Fetch the user's security information
    const result = await sql`
      SELECT 
        email_verified AS "emailVerified", 
        phone_verified AS "phoneVerified", 
        two_factor_enabled AS "twoFactorEnabled",
        two_factor_method AS "twoFactorMethod"
      FROM users
      WHERE id = ${session.user.id}
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
