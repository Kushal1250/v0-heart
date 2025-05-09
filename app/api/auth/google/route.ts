import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    // Get the base URL from the request
    const baseUrl = request.headers.get("host") || process.env.NEXT_PUBLIC_APP_URL || "localhost:3000"
    const protocol = baseUrl.includes("localhost") ? "http" : "https"

    // Construct the redirect URI using the actual host
    const redirectUri = `${protocol}://${baseUrl}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.json({ message: "OAuth configuration missing" }, { status: 500 })
    }

    // Generate state for CSRF protection
    const state = uuidv4()

    // Store state in cookie for validation
    const response = NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&scope=email%20profile&state=${state}`,
    )

    // Set state cookie to verify on callback
    response.cookies.set({
      name: "oauth_state",
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.redirect(new URL("/signup?error=auth_failed", request.url))
  }
}
