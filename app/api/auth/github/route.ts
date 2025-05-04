import { type NextRequest, NextResponse } from "next/server"
import { getGitHubOAuthConfig } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  try {
    const config = getGitHubOAuthConfig()

    if (!config.isConfigured) {
      console.error("GitHub OAuth is not configured properly")
      return NextResponse.redirect(new URL("/signup?error=github_not_configured", request.url))
    }

    // GitHub OAuth parameters
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: "read:user user:email",
      state: Math.random().toString(36).substring(2, 15),
    })

    // Log the exact redirect URI being used
    console.log("GitHub OAuth redirect URI:", config.redirectUri)

    // Redirect to GitHub authorization URL
    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("GitHub auth error:", error)
    return NextResponse.redirect(new URL("/signup?error=auth_failed", request.url))
  }
}
