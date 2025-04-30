import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyPassword, createSession } from "@/lib/auth-utils"
import { getUserByEmail } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, password, phone, rememberMe } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Verify phone if provided
    if (phone && user.phone && phone !== user.phone) {
      return NextResponse.json({ message: "Invalid phone number" }, { status: 401 })
    }

    // Create session
    const { token, expiresAt } = await createSession(user.id, rememberMe)

    // Set session cookie
    const cookieStore = cookies()

    // Calculate expiration time
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 24 hours

    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    })

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error("Error in login route:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
