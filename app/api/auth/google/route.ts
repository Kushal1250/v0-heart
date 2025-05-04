import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getGoogleOAuthConfig } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  try {
    // Get Google OAuth configuration
    const { clientId, clientSecret, redirectUri, isConfigured } = getGoogleOAuthConfig()

    // Check if Google OAuth is configured
    if (!isConfigured) {
      console.error("[OAuth] Google OAuth is not configured")
      return NextResponse.redirect(new URL("/login?error=oauth_not_configured", request.url))
    }

    // Generate state for CSRF protection
    const state = uuidv4()

    // Create the authorization URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("scope", "email profile")
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("prompt", "select_account")

    console.log("[OAuth] Initiating Google OAuth flow")
    console.log("[OAuth] Redirect URI:", redirectUri)

    // Store state in cookie for validation
    const response = NextResponse.redirect(authUrl.toString())

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
    console.error("[OAuth] Google auth error:", error)
    return NextResponse.redirect(new URL("/login?error=oauth_error", request.url))
  }
}
