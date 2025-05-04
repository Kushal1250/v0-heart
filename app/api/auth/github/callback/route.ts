import { type NextRequest, NextResponse } from "next/server"
import { getGitHubOAuthConfig } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code) {
      throw new Error("No authorization code provided")
    }

    const config = getGitHubOAuthConfig()

    // Exchange the code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error("GitHub token error:", tokenData)
      throw new Error("Failed to get access token")
    }

    // Get user profile using the access token
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    // Get user email if not provided in profile
    let userEmail = userData.email

    if (!userEmail) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${tokenData.access_token}`,
        },
      })

      const emails = await emailsResponse.json()
      const primaryEmail = emails.find((email: any) => email.primary)
      userEmail = primaryEmail ? primaryEmail.email : emails[0]?.email
    }

    // Normalize the user data
    const normalizedUserData = {
      provider: "github",
      providerId: userData.id.toString(),
      name: userData.name || userData.login,
      email: userEmail,
      avatar: userData.avatar_url,
    }

    // Handle the login/registration process
    // This is a placeholder - you'll need to implement your actual login logic
    // For now, we'll just redirect to dashboard with the user data
    const userDataParam = encodeURIComponent(JSON.stringify(normalizedUserData))
    return NextResponse.redirect(new URL(`/dashboard?userData=${userDataParam}`, request.url))
  } catch (error) {
    console.error("GitHub callback error:", error)
    return NextResponse.redirect(new URL("/signup?error=github_auth_failed", request.url))
  }
}
