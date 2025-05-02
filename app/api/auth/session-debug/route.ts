import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionByToken, getUserById } from "@/lib/db"

export async function GET() {
  try {
    // Get the session token from cookies
    const sessionToken = cookies().get("session")?.value
    const isAdminCookie = cookies().get("is_admin")?.value

    // Basic cookie info
    const cookieInfo = {
      sessionExists: !!sessionToken,
      sessionValue: sessionToken ? `${sessionToken.substring(0, 5)}...` : null,
      isAdminCookie: isAdminCookie === "true",
      allCookies: Array.from(cookies().getAll()).map((c) => ({
        name: c.name,
        value: c.name === "session" ? `${c.value.substring(0, 5)}...` : c.value,
        path: c.path,
        expires: c.expires,
      })),
    }

    // If no session token, return early
    if (!sessionToken) {
      return NextResponse.json({
        status: "unauthenticated",
        message: "No session token found",
        cookieInfo,
      })
    }

    // Check if session exists in database
    const session = await getSessionByToken(sessionToken)

    if (!session) {
      return NextResponse.json({
        status: "invalid_session",
        message: "Session token not found in database",
        cookieInfo,
      })
    }

    // Check if session is expired
    const isExpired = new Date(session.expires_at) < new Date()

    if (isExpired) {
      return NextResponse.json({
        status: "expired_session",
        message: "Session has expired",
        sessionInfo: {
          expiresAt: session.expires_at,
          createdAt: session.created_at,
          isExpired,
        },
        cookieInfo,
      })
    }

    // Get user info
    const user = await getUserById(session.user_id)

    if (!user) {
      return NextResponse.json({
        status: "user_not_found",
        message: "User not found for session",
        sessionInfo: {
          expiresAt: session.expires_at,
          createdAt: session.created_at,
          isExpired,
        },
        cookieInfo,
      })
    }

    // Return session and user info (without sensitive data)
    return NextResponse.json({
      status: "authenticated",
      message: "Session is valid",
      sessionInfo: {
        expiresAt: session.expires_at,
        createdAt: session.created_at,
        isExpired,
        timeRemaining: new Date(session.expires_at).getTime() - Date.now(),
      },
      userInfo: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === "admin",
      },
      cookieInfo,
    })
  } catch (error) {
    console.error("Session debug error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
