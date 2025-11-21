import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserByEmail, getUserByPhone } from "@/lib/db"
import { sendEmail } from "@/lib/email-utils"
import { sendSMS, isValidPhone } from "@/lib/sms-utils"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { identifier, method } = await request.json()

    if (!identifier) {
      return NextResponse.json({ success: false, message: "Email or phone number is required" }, { status: 400 })
    }

    if (!method || (method !== "email" && method !== "sms")) {
      return NextResponse.json({ success: false, message: "Valid verification method is required" }, { status: 400 })
    }

    console.log(`Sending verification code to ${identifier} via ${method}`)

    // Validate phone number if method is SMS
    if (method === "sms") {
      const isValid = await isValidPhone(identifier)
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Invalid phone number format. Please enter a valid phone number." },
          { status: 400 },
        )
      }
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`Generated verification code: ${code}`)

    // Check if the verification_codes table exists, create if not
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      );
    `

    if (!tableExists[0].exists) {
      console.log("Creating verification_codes table...")
      await sql`
        CREATE TABLE verification_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
        )
      `
    }

    // Get user ID if identifier is an email or phone
    let userId = identifier
    let user = null

    if (method === "email" && identifier.includes("@")) {
      user = await getUserByEmail(identifier)
    } else if (method === "sms") {
      user = await getUserByPhone(identifier)
    }

    if (user) {
      userId = user.id
      console.log(`Found user ID ${userId} for identifier ${identifier}`)
    }

    // Delete any existing codes for this user/identifier
    await sql`DELETE FROM verification_codes WHERE user_id = ${userId} OR user_id = ${identifier}`

    // Store the new code
    const verificationId = uuidv4()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await sql`
      INSERT INTO verification_codes (id, user_id, code, expires_at)
      VALUES (${verificationId}, ${userId}, ${code}, ${expiresAt})
    `
    console.log(`Stored verification code in database for ${userId}`)

    // Send the code via the specified method
    if (method === "email") {
      const emailResult = await sendEmail(
        identifier,
        "Your Verification Code",
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your Verification Code</h2>
            <p>Use the following code to verify your account:</p>
            <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              ${code}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
        `Your verification code is: ${code}. It will expire in 15 minutes.`,
      )

      if (!emailResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: emailResult.error || "Failed to send verification email",
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email",
        previewUrl: emailResult.previewUrl,
      })
    } else if (method === "sms") {
      // Use our improved SMS function
      const smsResult = await sendSMS(identifier, `Your verification code is: ${code}. It will expire in 15 minutes.`)

      if (!smsResult.success) {
        console.error("SMS sending failed:", smsResult)

        // If we have a user with an email, try email as fallback
        if (user && user.email) {
          console.log(`Attempting email fallback for user ${user.id}`)
          const emailResult = await sendEmail(
            user.email,
            "Your Verification Code",
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Your Verification Code</h2>
                <p>Use the following code to verify your account:</p>
                <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                  ${code}
                </div>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <p><small>Note: We sent this code via email because SMS delivery failed.</small></p>
              </div>
            `,
            `Your verification code is: ${code}. It will expire in 15 minutes.`,
          )

          if (emailResult.success) {
            return NextResponse.json({
              success: true,
              message: "SMS delivery failed, but we sent your code via email instead",
              method: "email",
              fallbackUsed: true,
            })
          }
        }

        return NextResponse.json(
          {
            success: false,
            message: smsResult.message || "Failed to send verification SMS",
            errorDetails: smsResult.errorDetails,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your phone",
      })
    }

    return NextResponse.json({ success: false, message: "Invalid verification method" }, { status: 400 })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while sending the verification code",
      },
      { status: 500 },
    )
  }
}
