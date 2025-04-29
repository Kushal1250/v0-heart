import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone, createVerificationCode } from "@/lib/db"
import { isValidEmail, getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, phone, isLoggedIn } = await request.json()

    // If user is logged in, get their info from the session
    if (isLoggedIn) {
      const currentUser = await getUserFromRequest(request as any)

      if (!currentUser) {
        return NextResponse.json({ message: "Authentication required" }, { status: 401 })
      }

      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Store the code in the database
      await createVerificationCode(currentUser.id, code)

      // In a real application, send the code via email or SMS
      console.log(`Verification code for logged-in user: ${code}`)

      return NextResponse.json({ message: "Verification code sent" })
    }

    // For non-logged in users, validate input
    if (!email && !phone) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 })
    }

    // Check if user exists
    let user = null
    if (email) {
      user = await getUserByEmail(email)
    } else if (phone) {
      user = await getUserByPhone(phone)
    }

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a verification code has been sent" })
    }

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store the code in the database
    await createVerificationCode(user.id, code)

    // In a real application, send the code via email or SMS
    console.log(`Verification code: ${code}`)

    return NextResponse.json({ message: "If an account exists, a verification code has been sent" })
  } catch (error) {
    console.error("Verification code request error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
