import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionByToken, updateSessionExpiry } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const sessionToken = (await cookies()).get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "No session token found" }, { status: 401 })
    }

    // Check if the session exists
    const session = await getSessionByToken(sessionToken)

    if (!session) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 })
    }

    const isAdmin = (await cookies()).get("is_admin")?.value === "true"

    // Generate a new token
    const newToken = generateToken()

    // Set the expiry date (7 days for admin, 1 day for regular users)
    const expiresAt = new Date(Date.now() + (isAdmin ? 7 : 1) * 24 * 60 * 60 * 1000)

    // Update the session expiry in the database
    await updateSessionExpiry(sessionToken, expiresAt)

    // Create the response
    const response = NextResponse.json({
      success: true,
      message: "Session refreshed successfully",
    })

    // Set the cookies with the new expiry
    response.cookies.set({
      name: "session",
      value: newToken,
      httpOnly: true,
      path: "/",
      expires: expiresAt,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    response.cookies.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      path: "/",
      expires: expiresAt,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    // If it's an admin session, refresh the is_admin cookie too
    if (isAdmin) {
      response.cookies.set({
        name: "is_admin",
        value: "true",
        httpOnly: false,
        path: "/",
        expires: expiresAt,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    }

    return response
  } catch (error) {
    console.error("Error refreshing session:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while refreshing the session" },
      { status: 500 },
    )
  }
}
