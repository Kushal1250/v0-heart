import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone, createVerificationCode } from "@/lib/db"
import { isValidEmail, getUserFromRequest } from "@/lib/auth-utils"
import { sendSMS, isValidPhone } from "@/lib/sms-utils"

export async function POST(request: Request) {
  try {
    const { email, phone, isLoggedIn } = await request.json()
    console.log(
      `Verification request received: ${isLoggedIn ? "logged in" : "not logged in"}, email: ${email || "none"}, phone: ${phone || "none"}`,
    )

    // If user is logged in, get their info from the session
    if (isLoggedIn) {
      const currentUser = await getUserFromRequest(request as any)

      if (!currentUser) {
        console.log("Authentication required for logged-in user verification")
        return NextResponse.json({ message: "Authentication required" }, { status: 401 })
      }

      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      console.log(`Generated verification code for logged-in user: ${code}`)

      // Store the code in the database
      await createVerificationCode(currentUser.id, code)

      // Determine whether to send via email or SMS based on what was provided
      const contactMethod = phone ? "sms" : "email"

      if (contactMethod === "sms") {
        // Use the provided phone or the user's phone
        const phoneToUse = phone || currentUser.phone

        if (!phoneToUse) {
          console.log("No phone number provided or found in user profile")
          return NextResponse.json(
            {
              message: "No phone number provided or found in user profile",
            },
            { status: 400 },
          )
        }

        // Validate phone number
        const isValid = await isValidPhone(phoneToUse)
        if (!isValid) {
          console.log(`Invalid phone number format: ${phoneToUse}`)
          return NextResponse.json(
            {
              message: "Invalid phone number format. Please enter a valid phone number.",
            },
            { status: 400 },
          )
        }

        console.log(`Sending SMS verification to ${phoneToUse}`)
        const smsResult = await sendSMS(
          phoneToUse,
          `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`,
        )

        if (!smsResult.success) {
          console.error("SMS sending failed:", smsResult.message, smsResult.errorDetails)
          return NextResponse.json(
            {
              message: smsResult.message || "Failed to send verification code via SMS",
            },
            { status: 500 },
          )
        }
      } else {
        // In a real application, send the code via email
        // For now, just log it
        console.log(`Would send email verification code to ${currentUser.email}: ${code}`)
      }

      return NextResponse.json({
        message: "Verification code sent",
        method: contactMethod,
      })
    }

    // For non-logged in users, validate input
    if (!email && !phone) {
      console.log("Email or phone number is required")
      return NextResponse.json(
        {
          message: "Email or phone number is required",
        },
        { status: 400 },
      )
    }

    if (email && !isValidEmail(email)) {
      console.log(`Invalid email format: ${email}`)
      return NextResponse.json(
        {
          message: "Valid email is required",
        },
        { status: 400 },
      )
    }

    if (phone) {
      // Validate phone number
      const isValid = await isValidPhone(phone)
      if (!isValid) {
        console.log(`Invalid phone number format: ${phone}`)
        return NextResponse.json(
          {
            message: "Invalid phone number format. Please enter a valid phone number.",
          },
          { status: 400 },
        )
      }
    }

    // Check if user exists
    let user = null
    if (email) {
      user = await getUserByEmail(email)
    } else if (phone) {
      user = await getUserByPhone(phone)
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`Generated verification code: ${code}`)

    // Store the code in the database (even if user doesn't exist, for security)
    const identifier = user ? user.id : email || phone
    await createVerificationCode(identifier, code)

    // Send the code via SMS or email
    if (phone) {
      console.log(`Sending SMS verification to ${phone}`)
      const smsResult = await sendSMS(phone, `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`)

      if (!smsResult.success) {
        console.error("SMS sending failed:", smsResult.message, smsResult.errorDetails)
        return NextResponse.json(
          {
            message: smsResult.message || "Failed to send verification code via SMS",
          },
          { status: 500 },
        )
      }
    } else {
      // In a real application, send the code via email
      // For now, just log it
      console.log(`Would send email verification code to ${email}: ${code}`)
    }

    return NextResponse.json({
      message: "If an account exists, a verification code has been sent",
      method: phone ? "sms" : "email",
    })
  } catch (error: any) {
    console.error("Verification code request error:", error)
    return NextResponse.json(
      {
        message: "An error occurred while processing your request",
      },
      { status: 500 },
    )
  }
}
