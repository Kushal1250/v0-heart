import { NextResponse } from "next/server"
import { createUser, getUserByEmail, createSession } from "@/lib/db"
import { generateToken, isValidEmail, isStrongPassword, createResponseWithCookie } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error("Failed to parse request body:", e)
      return NextResponse.json({ message: "Invalid request format" }, { status: 400 })
    }

    const { email, password, name, phone } = body

    // Validate input
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    if (!phone) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 })
    }

    // Create user
    const user = await createUser(email, password, name, phone)
    if (!user) {
      return NextResponse.json({ message: "Failed to create user account" }, { status: 500 })
    }

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    const sessionCreated = await createSession(user.id, token, expiresAt)

    if (!sessionCreated) {
      return NextResponse.json({ message: "Failed to create user session" }, { status: 500 })
    }

    // Return user data (without password) and set cookie
    const { password: _, ...userWithoutPassword } = user
    return createResponseWithCookie({ user: userWithoutPassword, message: "User created successfully" }, token)
  } catch (error) {
    console.error("Signup error:", error)
    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during signup"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
