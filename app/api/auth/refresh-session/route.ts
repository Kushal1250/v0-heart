import { NextResponse } from "next/server"
import { verifyAuth, generateSessionToken } from "@/lib/auth-utils"
import { systemLogger } from "@/lib/system-logger"

export async function POST(request: Request) {
  try {
    // Verify the current session
    const authResult = await verifyAuth(request)

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired or invalid",
        },
        { status: 401 },
      )
    }

    // Generate a new session token with extended expiry
    const newToken = generateSessionToken({
      userId: authResult.user?.id || "",
      email: authResult.user?.email || "",
      role: authResult.user?.role || "user",
    })

    // Create the response
    const response = NextResponse.json({
      success: true,
      message: "Session refreshed successfully",
    })

    // Set the new session token cookie
    response.cookies.set({
      name: "session_token",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // 24 hours expiry
      maxAge: 24 * 60 * 60,
    })

    // Log the session refresh
    await systemLogger("INFO", "Session refreshed", {
      userId: authResult.user?.id,
      role: authResult.user?.role,
    })

    return response
  } catch (error) {
    console.error("Error refreshing session:", error)
    await systemLogger("ERROR", "Failed to refresh session", { error: String(error) })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh session",
      },
      { status: 500 },
    )
  }
}
