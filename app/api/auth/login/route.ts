import { NextResponse } from "next/server"
import { getUserByEmail, comparePasswords, createSession } from "@/lib/db"
import { generateToken, createResponseWithCookie } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password, phone } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Validate phone number is provided and in correct format
    if (!phone || phone.trim() === "") {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    // Make sure the phone number starts with a plus sign for international format
    if (!phone.startsWith("+")) {
      return NextResponse.json({ message: "Phone number must include country code (e.g., +1)" }, { status: 400 })
    }

    // Ensure the phone number contains only valid characters
    const phoneDigits = phone.replace(/\D/g, "")
    if (phoneDigits.length < 10) {
      return NextResponse.json({ message: "Phone number must have at least 10 digits" }, { status: 400 })
    }

    // Get user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Verify phone number
    if (!user.phone || phone !== user.phone) {
      return NextResponse.json({ message: "Invalid phone number" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await comparePasswords(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await createSession(user.id, token, expiresAt)

    // Return user data (without password) and set cookie
    const { password: _, ...userWithoutPassword } = user
    return createResponseWithCookie({ user: userWithoutPassword }, token)
  } catch (error) {
    console.error("Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during login"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
