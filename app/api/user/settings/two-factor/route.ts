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

    const { enabled, method = "sms" } = await request.json()

    // Check if the user has verified their phone number when enabling SMS 2FA
    if (enabled && method === "sms") {
      const userResult = await sql`
        SELECT phone_verified FROM users WHERE id = ${session.user.id}
      `

      if (userResult.rows[0]?.phone_verified !== true) {
        return NextResponse.json(
          { message: "You must verify your phone number before enabling SMS-based two-factor authentication" },
          { status: 400 },
        )
      }
    }

    // Check if the user has verified their email when enabling email 2FA
    if (enabled && method === "email") {
      const userResult = await sql`
        SELECT email_verified FROM users WHERE id = ${session.user.id}
      `

      if (userResult.rows[0]?.email_verified !== true) {
        return NextResponse.json(
          { message: "You must verify your email address before enabling email-based two-factor authentication" },
          { status: 400 },
        )
      }
    }

    // Update the user's two-factor authentication settings
    await sql`
      UPDATE users
      SET 
        two_factor_enabled = ${enabled},
        two_factor_method = ${method}
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating two-factor authentication:", error)
    return NextResponse.json({ message: "Failed to update two-factor authentication" }, { status: 500 })
  }
}
