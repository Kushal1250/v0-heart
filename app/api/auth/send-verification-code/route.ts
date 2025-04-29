import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone, createVerificationCode } from "@/lib/db"
import { isValidEmail, getUserFromRequest } from "@/lib/auth-utils"
import { isValidPhone } from "@/lib/enhanced-sms-utils"
import { sendSMS } from "@/lib/enhanced-sms-utils"
import { sendEmail } from "@/lib/email-utils"
import { logError, ErrorSeverity } from "@/lib/error-logger"

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
      try {
        await createVerificationCode(currentUser.id, code)
      } catch (error) {
        console.error("Error storing verification code:", error)
        const errorId = await logError("createVerificationCode", error, { userId: currentUser.id }, ErrorSeverity.HIGH)

        return NextResponse.json(
          {
            success: false,
            message: "Failed to store verification code. Please try again later.",
            errorDetails: error instanceof Error ? error.message : "Unknown database error",
            errorId,
          },
          { status: 500 },
        )
      }

      // Determine whether to send via email or SMS based on what was provided
      const contactMethod = phone ? "sms" : "email"

      if (contactMethod === "sms") {
        // Use the provided phone or the user's phone
        const phoneToUse = phone || currentUser.phone

        if (!phoneToUse) {
          console.log("No phone number provided or found in user profile")
          return NextResponse.json(
            {
              success: false,
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
              success: false,
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
          const errorId = await logError(
            "sendSMS",
            new Error(smsResult.errorDetails || smsResult.message),
            { phone: phoneToUse, ...smsResult.debugInfo },
            ErrorSeverity.HIGH,
          )

          return NextResponse.json(
            {
              success: false,
              message: smsResult.message || "Failed to send verification code via SMS",
              errorDetails: smsResult.errorDetails,
              debugInfo: smsResult.debugInfo,
              errorId,
            },
            { status: 500 },
          )
        }
      } else {
        // Send email verification
        const emailResult = await sendEmail({
          to: currentUser.email,
          subject: "Your Password Reset Code",
          text: `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`,
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
          console.error("Email sending failed:", emailResult.message)
          const errorId = await logError(
            "sendEmail",
            new Error(emailResult.message),
            { email: currentUser.email },
            ErrorSeverity.HIGH,
          )

          return NextResponse.json(
            {
              success: false,
              message: "Failed to send verification code via email. Please try again.",
              errorDetails: emailResult.message,
              previewUrl: emailResult.previewUrl,
              errorId,
            },
            { status: 500 },
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent",
        method: contactMethod,
      })
    }

    // For non-logged in users, validate input
    if (!email && !phone) {
      console.log("Email or phone number is required")
      return NextResponse.json(
        {
          success: false,
          message: "Email or phone number is required",
        },
        { status: 400 },
      )
    }

    if (email && !isValidEmail(email)) {
      console.log(`Invalid email format: ${email}`)
      return NextResponse.json(
        {
          success: false,
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
            success: false,
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
    try {
      await createVerificationCode(identifier, code)
    } catch (error) {
      console.error("Error storing verification code:", error)
      const errorId = await logError("createVerificationCode", error, { identifier }, ErrorSeverity.HIGH)

      return NextResponse.json(
        {
          success: false,
          message: "Failed to store verification code. Please try again later.",
          errorDetails: error instanceof Error ? error.message : "Unknown database error",
          errorId,
        },
        { status: 500 },
      )
    }

    // Send the code via SMS or email
    if (phone) {
      console.log(`Sending SMS verification to ${phone}`)
      const smsResult = await sendSMS(phone, `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`)

      if (!smsResult.success) {
        console.error("SMS sending failed:", smsResult.message, smsResult.errorDetails)
        const errorId = await logError(
          "sendSMS",
          new Error(smsResult.errorDetails || smsResult.message),
          { phone, ...smsResult.debugInfo },
          ErrorSeverity.HIGH,
        )

        return NextResponse.json(
          {
            success: false,
            message: smsResult.message || "Failed to send verification code via SMS",
            errorDetails: smsResult.errorDetails,
            debugInfo: smsResult.debugInfo,
            errorId,
          },
          { status: 500 },
        )
      }
    } else if (email) {
      // Send email verification
      console.log(`Sending email verification to ${email}`)
      const emailResult = await sendEmail({
        to: email,
        subject: "Your Password Reset Code",
        text: `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`,
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
        console.error("Email sending failed:", emailResult.message)
        const errorId = await logError("sendEmail", new Error(emailResult.message), { email }, ErrorSeverity.HIGH)

        return NextResponse.json(
          {
            success: false,
            message: "Failed to send verification code via email. Please try again.",
            errorDetails: emailResult.message,
            previewUrl: emailResult.previewUrl,
            errorId,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a verification code has been sent",
      method: phone ? "sms" : "email",
    })
  } catch (error: any) {
    console.error("Verification code request error:", error)
    const errorId = await logError("sendVerificationCode", error, {}, ErrorSeverity.HIGH)

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request",
        errorDetails: error instanceof Error ? error.message : "Unknown error",
        errorId,
      },
      { status: 500 },
    )
  }
}
