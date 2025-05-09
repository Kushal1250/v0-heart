import { NextResponse } from "next/server"
import { generateToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Check for existing cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const hasAdminCookie = cookieHeader.includes("is_admin=true")

    // If admin cookie exists, refresh the session
    if (hasAdminCookie) {
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const response = NextResponse.json({
        success: true,
        message: "Session refreshed successfully",
      })

      // Set cookies with proper configuration
      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        path: "/",
        expires: expiresAt,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      response.cookies.set({
        name: "session",
        value: token,
        httpOnly: true,
        path: "/",
        expires: expiresAt,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      response.cookies.set({
        name: "is_admin",
        value: "true",
        httpOnly: false, // Needs to be accessible from JavaScript
        path: "/",
        expires: expiresAt,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      return response
    }

    // If no admin cookie, check for regular user session
    // This would typically involve checking the database
    // For now, just return a 401 Unauthorized
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json({ message: "An error occurred while refreshing the session" }, { status: 500 })
  }
}
