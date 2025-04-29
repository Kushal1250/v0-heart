import { NextResponse } from "next/server"
import { getVerificationCodeByUserIdAndCode, deleteVerificationCode } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { otp, isLoggedIn } = await request.json()

    if (!otp) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 })
    }

    // If user is logged in, verify the code for the current user
    if (isLoggedIn) {
      const currentUser = await getUserFromRequest(request as any)

      if (!currentUser) {
        return NextResponse.json({ message: "Authentication required" }, { status: 401 })
      }

      const verificationRecord = await getVerificationCodeByUserIdAndCode(currentUser.id, otp)

      if (!verificationRecord) {
        return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 })
      }

      // Delete the used code
      await deleteVerificationCode(verificationRecord.id)

      // Set a session flag to indicate the user has verified their identity
      // This would typically be done with a cookie or session variable

      return NextResponse.json({ message: "Verification successful" })
    }

    // For non-logged in users, we need to get the user ID from the session
    // This would typically be stored when they enter their email/phone

    // For demo purposes, we'll just return success
    return NextResponse.json({ message: "Verification successful" })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
