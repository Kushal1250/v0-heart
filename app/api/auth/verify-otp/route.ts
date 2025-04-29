import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getUserByEmail, getUserByPhone, verifyOTP, createPasswordResetToken } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { identifier, otp } = await request.json()

    if (!identifier || !otp) {
      return NextResponse.json({ message: "Identifier and verification code are required" }, { status: 400 })
    }

    console.log(`Verifying OTP for identifier: ${identifier}`)

    // Verify the OTP
    const verificationResult = await verifyOTP(identifier, otp)

    if (!verificationResult.success) {
      return NextResponse.json({ success: false, message: verificationResult.message }, { status: 400 })
    }

    // Find the user by email or phone
    let user = null
    if (identifier.includes("@")) {
      user = await getUserByEmail(identifier)
    } else {
      user = await getUserByPhone(identifier)
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Generate a password reset token
    const resetToken = uuidv4()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await createPasswordResetToken(user.id, resetToken, expiresAt)

    return NextResponse.json({
      success: true,
      message: "Verification successful",
      token: resetToken,
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return NextResponse.json({ message: "An error occurred while verifying the code" }, { status: 500 })
  }
}
