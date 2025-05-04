import { NextResponse } from "next/server"
import { getGoogleOAuthConfig, getBaseUrl } from "@/lib/oauth-config"

export async function GET() {
  try {
    const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig()
    const baseUrl = getBaseUrl()

    return NextResponse.json({
      google: {
        clientIdConfigured: !!clientId,
        clientSecretConfigured: !!clientSecret,
        redirectUri,
      },
      baseUrl,
    })
  } catch (error) {
    console.error("Error getting OAuth status:", error)
    return NextResponse.json({ error: "Failed to get OAuth status" }, { status: 500 })
  }
}
