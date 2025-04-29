import { type NextRequest, NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/auth-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { identifier, method = "email" } = body

    // Validate required fields
    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or phone number is required",
        },
        { status: 400 },
      )
    }

    if (method !== "email" && method !== "sms") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification method. Use 'email' or 'sms'.",
        },
        { status: 400 },
      )
    }

    // Send the verification code
    const result = await sendVerificationCode(identifier, method)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 },
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Verification code sent via ${method}`,
      previewUrl: result.previewUrl,
    })
  } catch (error) {
    // Log the error
    await logError("send-verification-code-route", error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while sending the verification code",
      },
      { status: 500 },
    )
  }
}
