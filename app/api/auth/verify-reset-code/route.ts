import { NextResponse } from "next/server"
import { getUserByEmail, getVerificationCodeByUserIdAndCode } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ message: "Email and code are required" }, { status: 400 })
    }

    // Find user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400 })
    }

    // Verify the code
    const verificationRecord = await getVerificationCodeByUserIdAndCode(user.id, code)
    if (!verificationRecord) {
      return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 })
    }

    // Generate a temporary token for password reset
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store the token in the database
    const { sql } = await import("@vercel/postgres")
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt})
    `

    // Return the token to be used for password reset
    return NextResponse.json({
      message: "Verification successful",
      token,
    })
  } catch (error) {
    console.error("Error verifying reset code:", error)
    return NextResponse.json({ message: "An error occurred while verifying the code" }, { status: 500 })
  }
}
