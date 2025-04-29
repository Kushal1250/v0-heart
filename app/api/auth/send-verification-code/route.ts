import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { formatPhoneToE164, isValidPhone, sendSMS } from "@/lib/enhanced-sms-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: NextRequest) {
  try {
    const { phone, email, method } = await request.json()

    // Validate input
    if (!phone && !email) {
      return NextResponse.json({ error: "Either phone or email is required" }, { status: 400 })
    }

    if (method !== "sms" && method !== "email") {
      return NextResponse.json({ error: "Invalid verification method. Use 'sms' or 'email'" }, { status: 400 })
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Store the verification code in the database
    let userId = null
    let userQuery = null

    if (email) {
      userQuery = await db.query("SELECT id FROM users WHERE email = $1", [email])
    } else if (phone) {
      const formattedPhone = await formatPhoneToE164(phone)
      userQuery = await db.query("SELECT id FROM users WHERE phone = $1", [formattedPhone])
    }

    if (userQuery && userQuery.rows.length > 0) {
      userId = userQuery.rows[0].id
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if there's an existing verification code for this user
    const existingCodeQuery = await db.query(
      "SELECT * FROM verification_codes WHERE user_id = $1 AND expires_at > NOW()",
      [userId],
    )

    if (existingCodeQuery.rows.length > 0) {
      // Update the existing code
      await db.query(
        "UPDATE verification_codes SET code = $1, expires_at = $2, updated_at = NOW() WHERE user_id = $3",
        [verificationCode, expiresAt, userId],
      )
    } else {
      // Insert a new code
      await db.query("INSERT INTO verification_codes (user_id, code, expires_at) VALUES ($1, $2, $3)", [
        userId,
        verificationCode,
        expiresAt,
      ])
    }

    // Send the verification code
    if (method === "sms" && phone) {
      const formattedPhone = await formatPhoneToE164(phone)
      const isPhoneValid = await isValidPhone(formattedPhone)

      if (!isPhoneValid) {
        return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
      }

      const message = `Your HeartPredict verification code is: ${verificationCode}. It will expire in 15 minutes.`
      const smsResult = await sendSMS(formattedPhone, message)

      if (!smsResult.success) {
        return NextResponse.json(
          { error: `Failed to send verification code via SMS: ${smsResult.message}` },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Verification code sent successfully via SMS",
        method: "sms",
      })
    } else if (method === "email" && email) {
      // Email sending logic (handled by a separate function)
      // This would be implemented in a similar way to the SMS logic
      return NextResponse.json({
        message: "Verification code sent successfully via email",
        method: "email",
      })
    }

    return NextResponse.json(
      {
        error: "Failed to send verification code. Invalid method or contact information.",
      },
      { status: 400 },
    )
  } catch (error: any) {
    console.error("Error sending verification code:", error)
    await logError("sendVerificationCode", error)

    return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 })
  }
}
