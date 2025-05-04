import { NextResponse } from "next/server"
import { getGitHubOAuthConfig, getBaseUrl } from "@/lib/oauth-config"

export async function GET() {
  try {
    const config = getGitHubOAuthConfig()
    const baseUrl = getBaseUrl()

    // Return status without exposing the full client secret
    return NextResponse.json({
      clientId: config.clientId || null,
      clientSecret: config.clientSecret ? true : null,
      redirectUri: config.redirectUri,
      baseUrl,
      isConfigured: config.isConfigured,
    })
  } catch (error) {
    console.error("Error getting GitHub OAuth status:", error)
    return NextResponse.json({ error: "Failed to get GitHub OAuth status" }, { status: 500 })
  }
}
