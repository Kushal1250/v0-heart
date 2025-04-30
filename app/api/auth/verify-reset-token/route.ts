import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false, message: "Token is required" }, { status: 400 })
    }

    const { sql } = await import("@vercel/postgres")

    // Get the token from the database
    const result = await sql`
      SELECT user_id, expires_at 
      FROM password_reset_tokens 
      WHERE token = ${token}
    `

    if (result.rowCount === 0) {
      return NextResponse.json({ valid: false, message: "Invalid or expired token" }, { status: 400 })
    }

    const resetToken = result.rows[0]

    // Check if token has expired
    if (new Date() > new Date(resetToken.expires_at)) {
      return NextResponse.json({ valid: false, message: "Token has expired" }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error verifying reset token:", error)
    return NextResponse.json({ valid: false, message: "An error occurred while verifying the token" }, { status: 500 })
  }
}
