import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, createSession } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"
import { getGoogleOAuthConfig, getBaseUrl } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  try {
    console.log("[OAuth] Callback received")

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    const baseUrl = getBaseUrl()

    // Check for errors from Google
    if (error) {
      console.error("[OAuth] Error from Google:", error)
      return NextResponse.redirect(`${baseUrl}/login?error=google_${error}`)
    }

    // Validate state to prevent CSRF
    const storedState = request.cookies.get("oauth_state")?.value
    if (!state || !storedState || state !== storedState) {
      console.error("[OAuth] Invalid state - possible CSRF attempt")
      return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`)
    }

    if (!code) {
      console.error("[OAuth] No authorization code provided")
      return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
    }

    // Get Google OAuth configuration
    const { clientId, clientSecret, redirectUri, isConfigured } = getGoogleOAuthConfig()

    if (!isConfigured) {
      console.error("[OAuth] Google OAuth is not configured")
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_not_configured`)
    }

    console.log("[OAuth] Exchanging code for token")
    console.log("[OAuth] Using redirect URI:", redirectUri)

    // Exchange code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("[OAuth] Token exchange failed:", tokenData)
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange`)
    }

    // Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error("[OAuth] Failed to get user data:", userData)
      return NextResponse.redirect(`${baseUrl}/login?error=user_data`)
    }

    console.log("[OAuth] User data retrieved:", userData.email)

    // Check if user exists
    let user = await getUserByEmail(userData.email)

    // Create user if they don't exist
    if (!user) {
      console.log("[OAuth] Creating new user:", userData.email)
      user = await createUser(
        userData.email,
        generateToken(), // Generate random password for OAuth users
        userData.name,
      )
    } else {
      console.log("[OAuth] User already exists:", userData.email)
    }

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await createSession(user.id, token, expiresAt)

    // Create response with session cookie
    const response = NextResponse.redirect(`${baseUrl}/dashboard`)
    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[OAuth] Callback error:", error)
    const baseUrl = getBaseUrl()
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`)
  }
}
