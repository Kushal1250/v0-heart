import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@neondatabase/serverless"
import { generateVerificationCode, getSessionToken, getUserFromSession } from "@/lib/auth-utils"
import { sendSMS } from "@/lib/enhanced-sms-utils"
import { sendVerificationEmail } from "@/lib/email-utils"

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const sessionToken = getSessionToken()
    const user = await getUserFromSession(sessionToken)

    if (!user) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const { phoneNumber, method = "sms" } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    // Generate a 6-digit verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Store the verification code in the database
    await sql`
      INSERT INTO verification_codes (user_id, code, expires_at, type)
      VALUES (${user.id}, ${code}, ${expiresAt.toISOString()}, 'phone_verification')
    `

    // Update the user's phone number
    await sql`
      UPDATE users
      SET phone = ${phoneNumber}, phone_verified = false
      WHERE id = ${user.id}
    `

    // Send the verification code
    if (method === "sms") {
      await sendSMS(phoneNumber, `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`)
    } else if (method === "email") {
      await sendVerificationEmail(
        user.email,
        "Phone Verification Code",
        `Your verification code is: ${code}. Valid for 15 minutes.`,
      )
    } else {
      return NextResponse.json({ message: "Invalid verification method" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json({ message: "Failed to send verification code" }, { status: 500 })
  }
}
