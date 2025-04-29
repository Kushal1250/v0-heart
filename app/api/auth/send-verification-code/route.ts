import { NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/auth-utils"
import { isValidEmail } from "@/lib/client-validation"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, isLoggedIn = false } = body

    console.log("Received verification code request:", { email, phone, isLoggedIn })

    // Validate input
    if (!email && !phone) {
      return NextResponse.json({ success: false, message: "Email or phone number is required" }, { status: 400 })
    }

    // Determine method and identifier
    let method: "email" | "sms"
    let identifier: string

    if (email) {
      method = "email"
      identifier = email

      // Validate email format
      if (!isValidEmail(email)) {
        return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
      }
    } else {
      method = "sms"
      identifier = phone

      // Basic phone validation
      const phoneDigits = phone.replace(/\D/g, "")
      if (phoneDigits.length < 10) {
        return NextResponse.json({ success: false, message: "Invalid phone number format" }, { status: 400 })
      }
    }

    // Send verification code
    console.log(`Sending verification code to ${identifier} via ${method}`)
    const result = await sendVerificationCode(email || phone, method)

    // Return the result with any previewUrl for development testing
    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.message,
        previewUrl: result.previewUrl,
      }),
      {
        status: result.success ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error in send-verification-code route:", error)
    await logError("send-verification-code", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? `Server error: ${error.message}` : "An unknown server error occurred",
      },
      { status: 500 },
    )
  }
}
