import { type NextRequest, NextResponse } from "next/server"
import { getProviderConfig } from "@/lib/social-auth"

export async function GET(request: NextRequest) {
  try {
    // Get GitHub OAuth configuration
    const config = getProviderConfig("github")

    // Verify configuration
    if (!config.clientId || !config.clientSecret) {
      console.error("GitHub OAuth credentials missing")
      return NextResponse.redirect(new URL("/signup?error=github_config_missing", request.url))
    }

    // Generate a state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)

    // Store state in a cookie for verification
    const response = NextResponse.redirect(
      `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scope)}&state=${state}`,
    )

    // Set state cookie
    response.cookies.set("github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
      sameSite: "lax",
    })

    // Log the redirect for debugging
    console.log("GitHub OAuth redirect:", config.redirectUri)

    return response
  } catch (error) {
    console.error("GitHub auth error:", error)
    return NextResponse.redirect(new URL("/signup?error=github_auth_error", request.url))
  }
}
