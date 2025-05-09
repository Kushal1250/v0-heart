import { NextResponse } from "next/server"
import { sendVerificationCode, isValidEmail } from "@/lib/auth-utils"
import { getUserByEmail } from "@/lib/db"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    const { identifier, method, purpose } = await request.json()

    console.log(
      `Verification code request received - Identifier: ${identifier}, Method: ${method}, Purpose: ${purpose}`,
    )

    // Validate inputs
    if (!identifier) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    if (!method || !["email", "sms"].includes(method)) {
      return NextResponse.json({ message: "Valid verification method is required" }, { status: 400 })
    }

    // Validate email format if method is email
    if (method === "email" && !(await isValidEmail(identifier))) {
      return NextResponse.json({ message: "Please enter a valid email address" }, { status: 400 })
    }

    // For password reset, check if the user exists
    if (purpose === "password-reset") {
      const user = await getUserByEmail(identifier).catch((err) => {
        console.error("Error checking user existence:", err)
        return null
      })

      // For security reasons, don't reveal if the user exists or not
      if (!user) {
        console.log(`No user found with identifier: ${identifier}`)
        // Return success even if user doesn't exist (security best practice)
        return NextResponse.json({
          success: true,
          message: "If an account exists with this identifier, a verification code has been sent",
        })
      }
    }

    // Send verification code
    console.log(`Sending verification code to ${identifier} via ${method}`)
    const result = await sendVerificationCode(identifier, method)

    if (!result.success) {
      console.error(`Failed to send verification code: ${result.message}`)
      return NextResponse.json({ message: result.message }, { status: 500 })
    }

    console.log(`Verification code sent successfully to ${identifier}`)
    return NextResponse.json({
      success: true,
      message: `Verification code sent via ${method}`,
      // Include previewUrl in development environment for testing
      ...(process.env.NODE_ENV === "development" && result.previewUrl ? { previewUrl: result.previewUrl } : {}),
      // Include previewCode in development environment for testing
      ...(process.env.NODE_ENV === "development" && process.env.ENABLE_DEBUG_ENDPOINTS === "true"
        ? { previewCode: "123456" }
        : {}),
    })
  } catch (error) {
    console.error("Error sending verification code:", error)
    await logError("send-verification-code", error)
    return NextResponse.json({ message: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
