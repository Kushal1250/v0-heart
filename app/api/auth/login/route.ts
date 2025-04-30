import { NextResponse } from "next/server"
import { getUserByEmail, comparePasswords, createSession } from "@/lib/db"
import { generateToken, createResponseWithCookie } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password, phone, rememberMe } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Validate phone number is provided
    if (!phone) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
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

    // Create session with appropriate expiration based on rememberMe
    const token = generateToken()

    // Set expiration time based on rememberMe flag
    // 30 days if rememberMe is true, 24 hours if false
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000)

    await createSession(user.id, token, expiresAt)

    // Return user data (without password) and set cookie with appropriate expiration
    const { password: _, ...userWithoutPassword } = user
    return createResponseWithCookie(
      {
        user: userWithoutPassword,
        rememberMe,
      },
      token,
      rememberMe,
    )
  } catch (error) {
    console.error("Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during login"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
