import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone, createVerificationCode } from "@/lib/db"
import { isValidEmail, getUserFromRequest } from "@/lib/auth-utils"
import { sendSMS, isValidPhone } from "@/lib/sms-utils"

export async function POST(request: Request) {
  try {
    const { email, phone, isLoggedIn } = await request.json()

    // If user is logged in, get their info from the session
    if (isLoggedIn) {
      const currentUser = await getUserFromRequest(request as any)

      if (!currentUser) {
        return NextResponse.json({ message: "Authentication required" }, { status: 401 })
      }

      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Store the code in the database
      await createVerificationCode(currentUser.id, code)

      // Determine whether to send via email or SMS based on what was provided
      const contactMethod = phone ? "sms" : "email"

      if (contactMethod === "sms" && currentUser.phone) {
        // Use the server-side validation
        const isValid = await isValidPhone(currentUser.phone)
        if (!isValid) {
          return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 })
        }

        const smsResult = await sendSMS(
          currentUser.phone,
          `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`,
        )

        if (!smsResult.success) {
          console.error("SMS sending failed:", smsResult.message)
          // Fall back to console log for development
          console.log(`Verification code for logged-in user: ${code}`)
        }
      } else {
        // In a real application, send the code via email
        // For now, just log it
        console.log(`Verification code for logged-in user: ${code}`)
      }

      return NextResponse.json({
        message: "Verification code sent",
        method: contactMethod,
      })
    }

    // For non-logged in users, validate input
    if (!email && !phone) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 })
    }

    if (phone) {
      // Use the server-side validation
      const isValid = await isValidPhone(phone)
      if (!isValid) {
        return NextResponse.json({ message: "Valid phone number is required" }, { status: 400 })
      }
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
        message: "If an account exists, a verification code has been sent",
        method: phone ? "sms" : "email",
      })
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the code in the database
    await createVerificationCode(user.id, code)

    // Send the code via SMS or email
    if (phone) {
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
      message: "If an account exists, a verification code has been sent",
      method: phone ? "sms" : "email",
    })
  } catch (error) {
    console.error("Verification code request error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
