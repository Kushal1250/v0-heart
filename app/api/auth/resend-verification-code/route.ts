import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone, createVerificationCode } from "@/lib/db"
import { sendSMS, isValidPhone } from "@/lib/sms-utils"

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json()

    if (!email && !phone) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    // Check if user exists
    let user = null
    if (email) {
      user = await getUserByEmail(email)
    } else if (phone) {
      user = await getUserByPhone(phone)
    }

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a new verification code has been sent",
        method: phone ? "sms" : "email",
      })
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the code in the database
    await createVerificationCode(user.id, code)

    // Send the code via SMS or email
    if (phone) {
      // Use the server-side validation
      const isValid = await isValidPhone(phone)
      if (!isValid) {
        return NextResponse.json({ message: "Valid phone number is required" }, { status: 400 })
      }

      const smsResult = await sendSMS(phone, `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`)

      if (!smsResult.success) {
        console.error("SMS sending failed:", smsResult.message)
        // Fall back to console log for development
        console.log(`Verification code: ${code}`)
      }
    } else {
      // In a real application, send the code via email
      // For now, just log it
      console.log(`Verification code: ${code}`)
    }

    return NextResponse.json({
      message: "If an account exists, a new verification code has been sent",
      method: phone ? "sms" : "email",
    })
  } catch (error) {
    console.error("Resend verification code error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
