import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionByToken, getUserById, extendSession } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"

export async function POST() {
  try {
    // Get the current session token
    const sessionToken = cookies().get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "No session found" }, { status: 401 })
    }

    // Verify the session exists
    const session = await getSessionByToken(sessionToken)
    if (!session) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    // Get the user
    const user = await getUserById(session.user_id)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 })
    }

    // Generate a new token and extend the session
    const newToken = generateToken()
    await extendSession(sessionToken, newToken)

    // Create response with new session cookie
    const response = NextResponse.json({
      success: true,
      message: "Session refreshed",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Set the new session cookie with extended expiration
    const isAdmin = user.role === "admin"
    const maxAge = isAdmin ? 8 * 60 * 60 : 24 * 60 * 60 // 8 hours for admin, 24 hours for regular users

    response.cookies.set({
      name: "session",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json({ success: false, message: "Failed to refresh session" }, { status: 500 })
  }
}
