import { NextResponse } from "next/server"
import { verifyOTP, getUserByEmail } from "@/lib/db"
import { getUserFromRequest, isValidEmail } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { otp, identifier, isLoggedIn } = await request.json()

    if (!otp) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 })
    }

    // If user is logged in, verify the code for the current user
    if (isLoggedIn) {
      const currentUser = await getUserFromRequest(request as any)

      if (!currentUser) {
        return NextResponse.json({ message: "Authentication required" }, { status: 401 })
      }

      const result = await verifyOTP(currentUser.id, otp)

      if (!result.success) {
        return NextResponse.json({ message: result.message }, { status: 400 })
      }

      return NextResponse.json({
        message: "Verification successful",
        success: true,
        token: currentUser.id, // Use user ID as token for simplicity
      })
    }

    // For non-logged in users with identifier (email/phone)
    if (identifier) {
      let userId = identifier

      // Check if identifier is an email
      if (isValidEmail(identifier)) {
        const user = await getUserByEmail(identifier)
        if (!user) {
          return NextResponse.json({ message: "User not found" }, { status: 404 })
        }
        userId = user.id
      }

      const result = await verifyOTP(userId, otp)

      if (!result.success) {
        return NextResponse.json({ message: result.message }, { status: 400 })
      }

      return NextResponse.json({
        message: "Verification successful",
        success: true,
        token: userId, // Use user ID as token for simplicity
      })
    }

    return NextResponse.json({ message: "User identifier required" }, { status: 400 })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
