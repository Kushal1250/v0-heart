import { type NextRequest, NextResponse } from "next/server"
import { getProviderConfig, getBaseUrl } from "@/lib/social-auth"

export async function GET(request: NextRequest) {
  try {
    const config = getProviderConfig("github")
    const baseUrl = getBaseUrl()

    // Get environment information
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      baseUrl,
    }

    // Get GitHub configuration (redact secrets)
    const githubConfig = {
      clientId: config.clientId ? `${config.clientId.substring(0, 4)}...` : "Missing",
      clientSecret: config.clientSecret ? "Present (redacted)" : "Missing",
      redirectUri: config.redirectUri,
      authUrl: config.authUrl,
      tokenUrl: config.tokenUrl,
      userUrl: config.userUrl,
      emailUrl: config.emailUrl,
      scope: config.scope,
    }

    // Return debug information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envInfo,
      githubConfig,
      cookies: {
        hasGithubState: !!request.cookies.get("github_oauth_state"),
        hasAuthToken: !!request.cookies.get("auth_token"),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Debug error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
