import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getRedirectUri } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("[OAuth] Missing OAuth credentials")
      return NextResponse.json({ error: "OAuth configuration missing" }, { status: 500 })
    }

    // Use the hardcoded redirect URI
    const redirectUri = getRedirectUri("google")
    console.log("[OAuth] Using redirect URI:", redirectUri)

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

    console.log("[OAuth] Authorization URL:", authUrl.toString())

    // Store state in cookie for validation
    const response = NextResponse.redirect(authUrl.toString())

    response.cookies.set({
      name: "oauth_state",
      value: state,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[OAuth] Google auth error:", error)
    return NextResponse.redirect(new URL("/signup?error=auth_failed", request.url))
  }
}
