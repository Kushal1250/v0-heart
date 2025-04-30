import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail, comparePasswords } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password, phone, rememberMe } = await request.json()

    console.log("Login attempt:", { email, phoneProvided: !!phone, rememberMe })

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Get user
    const user = await getUserByEmail(email)

    if (!user) {
      console.log("User not found:", email)
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    console.log("User found:", { id: user.id, hasPassword: !!user.password })

    // Check password - using direct comparison for debugging
    const isPasswordValid = await comparePasswords(password, user.password)
    console.log("Password validation result:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Phone validation is optional - only check if both user has phone and phone was provided
    if (phone && user.phone && phone !== user.phone) {
      console.log("Phone number mismatch:", { provided: phone, stored: user.phone })
      return NextResponse.json({ message: "Invalid phone number" }, { status: 401 })
    }

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000) // 30 days or 24 hours

    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
      path: "/",
    })

    // Create session in database
    try {
      await createSession(user.id, token, expiresAt)
      console.log("Session created successfully")
    } catch (sessionError) {
      console.error("Error creating session:", sessionError)
      // Continue anyway to allow login
    }

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

// Helper function to create a session
async function createSession(userId: string, token: string, expiresAt: Date) {
  const { sql } = await import("@/lib/db")
  const { v4: uuidv4 } = await import("uuid")

  const sessionId = uuidv4()

  await sql`
    INSERT INTO sessions (id, user_id, token, expires_at)
    VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt})
  `

  return true
}
