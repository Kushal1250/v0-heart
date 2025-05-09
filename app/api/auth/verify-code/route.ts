import { NextResponse } from "next/server"
import { verifyOTP } from "@/lib/auth-utils"
import { generateToken } from "@/lib/auth-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    const { identifier, code, purpose } = await request.json()

    console.log(`Verification code validation request - Identifier: ${identifier}, Purpose: ${purpose}`)

    // Validate inputs
    if (!identifier) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 })
    }

    // Verify the code
    const result = await verifyOTP(identifier, code)

    if (!result.success) {
      console.log(`Verification failed: ${result.message}`)
      return NextResponse.json({ message: result.message }, { status: 400 })
    }

    console.log("Verification successful")

    // Generate a token for password reset
    const token = generateToken()

    // Return the token
    return NextResponse.json({
      success: true,
      message: "Verification successful",
      token,
    })
  } catch (error) {
    console.error("Error verifying code:", error)
    await logError("verify-code", error)
    return NextResponse.json({ message: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
