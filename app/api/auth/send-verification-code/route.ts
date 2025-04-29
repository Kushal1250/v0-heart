import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserByEmail } from "@/lib/db"
import { sendEmail } from "@/lib/email-utils"
import { sendSMS } from "@/lib/sms-utils"
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

    // Get user ID if identifier is an email
    let userId = identifier
    if (method === "email" && identifier.includes("@")) {
      const user = await getUserByEmail(identifier)
      if (user) {
        userId = user.id
        console.log(`Found user ID ${userId} for email ${identifier}`)
      }
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
      const emailResult = await sendEmail({
        to: identifier,
        subject: "Your Verification Code",
        text: `Your verification code is: ${code}. It will expire in 15 minutes.`,
        html: `
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
      })

      if (!emailResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: emailResult.message || "Failed to send verification email",
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
      const message = `Your verification code is: ${code}. It will expire in 15 minutes.`
      const smsResult = await sendSMS(identifier, message)

      if (!smsResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: smsResult.message || "Failed to send verification SMS",
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
