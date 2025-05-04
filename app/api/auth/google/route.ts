import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getRedirectUri } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("Missing OAuth credentials")
      return NextResponse.redirect(new URL("/signup?error=missing_credentials", request.url))
    }

    // Get the redirect URI using our helper
    const redirectUri = getRedirectUri("google", request)
    console.log("Using redirect URI:", redirectUri)

    // Generate state for CSRF protection
    const state = uuidv4()

    // Store state in cookie for validation
    const response = NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&scope=email%20profile&state=${state}&prompt=select_account`,
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
