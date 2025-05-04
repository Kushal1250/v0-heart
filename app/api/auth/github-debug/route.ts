import { NextResponse } from "next/server"
import { getProviderConfig } from "@/lib/social-auth"
import { getBaseUrl } from "@/lib/oauth-config"

export async function GET() {
  try {
    const config = getProviderConfig("github")
    const baseUrl = getBaseUrl()

    // Return debug information
    return NextResponse.json({
      baseUrl,
      redirectUri: config.redirectUri,
      clientIdConfigured: Boolean(config.clientId),
      clientSecretConfigured: Boolean(config.clientSecret),
      environment: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL || null,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
      possibleRedirectUris: [
        `${baseUrl}/api/auth/github/callback`,
        "https://heartgudie3.vercel.app/api/auth/github/callback",
        "http://localhost:3000/api/auth/github/callback",
      ],
    })
  } catch (error) {
    console.error("Error getting GitHub debug info:", error)
    return NextResponse.json({ error: "Failed to get GitHub debug info" }, { status: 500 })
  }
}
