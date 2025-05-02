import { NextResponse } from "next/server"
import { getUserByEmail, comparePasswords, createSession } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Get user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ message: "You do not have admin privileges" }, { status: 403 })
    }

    // Check password
    const isPasswordValid = await comparePasswords(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Create session with extended expiration for admins (7 days)
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await createSession(user.id, token, expiresAt)

    // Return user data (without password) and set cookie
    const { password: _, ...userWithoutPassword } = user

    // Create response with proper session cookie
    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
      user: userWithoutPassword,
    })

    // Set session cookie with proper attributes
    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    })

    // Set admin flag cookie (not httpOnly so JS can read it)
    response.cookies.set({
      name: "is_admin",
      value: "true",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during login"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
