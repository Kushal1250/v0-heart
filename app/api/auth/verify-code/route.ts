import { NextResponse } from "next/server"
import { getVerificationCode, deleteVerificationCode } from "@/lib/db"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json()

    // Validate inputs
    if (!identifier) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ success: false, message: "Verification code is required" }, { status: 400 })
    }

    console.log(`Verifying code for identifier: ${identifier}, code: ${code}`)

    // Get the verification code from the database
    const verificationCode = await getVerificationCode(identifier)

    // Check if the code exists
    if (!verificationCode) {
      console.log(`No verification code found for ${identifier}`)
      return NextResponse.json(
        { success: false, message: "Verification code not found or expired. Please request a new code." },
        { status: 400 },
      )
    }

    // Check if the code has expired
    if (new Date() > new Date(verificationCode.expires_at)) {
      console.log(`Verification code expired for ${identifier}`)
      await deleteVerificationCode(identifier)
      return NextResponse.json(
        { success: false, message: "Verification code has expired. Please request a new code." },
        { status: 400 },
      )
    }

    // Check if the code matches
    if (verificationCode.code !== code) {
      console.log(`Invalid verification code for ${identifier}: expected ${verificationCode.code}, got ${code}`)
      return NextResponse.json(
        { success: false, message: "Invalid verification code. Please try again." },
        { status: 400 },
      )
    }

    // Delete the code after successful verification
    await deleteVerificationCode(identifier)

    console.log(`Verification successful for ${identifier}`)
    return NextResponse.json({ success: true, message: "Verification successful." })
  } catch (error) {
    console.error("Error in verify-code route:", error)
    await logError("verify-code", error, { path: "/api/auth/verify-code" })
    return NextResponse.json(
      { success: false, message: "An error occurred while verifying the code." },
      { status: 500 },
    )
  }
}
