import { NextResponse } from "next/server"
import { getGoogleOAuthConfig, getBaseUrl } from "@/lib/oauth-config"

export async function GET() {
  const googleConfig = getGoogleOAuthConfig()

  return NextResponse.json({
    baseUrl: getBaseUrl(),
    google: {
      isConfigured: googleConfig.isConfigured,
      redirectUri: googleConfig.redirectUri,
      clientIdConfigured: Boolean(googleConfig.clientId),
      clientSecretConfigured: Boolean(googleConfig.clientSecret),
    },
  })
}
