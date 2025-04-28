import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, createSession } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Check for errors
    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_error`)
    }

    // Validate state to prevent CSRF
    const storedState = request.cookies.get("oauth_state")?.value
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_state`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`)
    }

    // Exchange code for token
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=token_exchange`)
    }

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error("Failed to get user data:", userData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=user_data`)
    }

    // Get user emails (GitHub doesn't return email in user data if it's private)
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
      },
    })

    const emailsData = await emailsResponse.json()

    // Find primary email
    let email = userData.email
    if (!email && Array.isArray(emailsData)) {
      const primaryEmail = emailsData.find((e: any) => e.primary)
      if (primaryEmail) {
        email = primaryEmail.email
      } else if (emailsData.length > 0) {
        email = emailsData[0].email
      }
    }

    if (!email) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_email`)
    }

    // Check if user exists
    let user = await getUserByEmail(email)

    // Create user if they don't exist
    if (!user) {
      user = await createUser(
        email,
        generateToken(), // Generate random password for OAuth users
        userData.name || email.split("@")[0], // Use name or part of email as name
      )
    }

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await createSession(user.id, token, expiresAt)

    // Create response with session cookie
    const response = NextResponse.redirect("https://heartguide2.vercel.app/")
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
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`)
  }
}
