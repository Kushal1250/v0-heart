import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, createSession } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"
import { getRedirectUri } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Get base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Check for errors from Google
    if (error) {
      console.error("[OAuth] Error from Google:", error)
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_error`)
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

    // Use the environment-based redirect URI
    const redirectUri = getRedirectUri("google")
    console.log("[OAuth] Callback using redirect URI:", redirectUri)

    // Exchange code for token
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

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

    // Check if user exists
    let user = await getUserByEmail(userData.email)

    // Create user if they don't exist
    if (!user) {
      user = await createUser(
        userData.email,
        generateToken(), // Generate random password for OAuth users
        userData.name,
      )
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
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[OAuth] Callback error:", error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`)
  }
}
