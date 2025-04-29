import { type NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/auth-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { identifier, code } = body

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

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code is required",
        },
        { status: 400 },
      )
    }

    // Verify the OTP
    const result = await verifyOTP(identifier, code)

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
      message: "Verification successful",
    })
  } catch (error) {
    // Log the error
    await logError("verify-otp-route", error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while verifying the code",
      },
      { status: 500 },
    )
  }
}
