import { NextResponse } from "next/server"
import { getUserByEmail, createSession } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not available in production" }, { status: 403 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find the user
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create a new session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await createSession(user.id, token, expiresAt)

    // Create the response with the session cookie
    const response = NextResponse.json({
      success: true,
      message: "Session reset successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set the session cookie
    response.cookies.set({
      name: "session",
      value: token,
      expires: expiresAt,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Error fixing session:", error)
    return NextResponse.json(
      {
        error: "Failed to fix session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
