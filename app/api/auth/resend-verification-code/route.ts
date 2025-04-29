import { NextResponse } from "next/server"
import { createVerificationCode } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { isLoggedIn } = await request.json()

    // If user is logged in, get their info from the session
    if (isLoggedIn) {
      const currentUser = await getUserFromRequest(request as any)

      if (!currentUser) {
        return NextResponse.json({ message: "Authentication required" }, { status: 401 })
      }

      // Generate a new 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Store the code in the database
      await createVerificationCode(currentUser.id, code)

      // In a real application, send the code via email or SMS
      console.log(`New verification code for logged-in user: ${code}`)

      return NextResponse.json({ message: "Verification code resent" })
    }

    // For non-logged in users, we would need to get their email/phone from the session
    // For demo purposes, we'll just return success
    return NextResponse.json({ message: "Verification code resent" })
  } catch (error) {
    console.error("Resend verification code error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
