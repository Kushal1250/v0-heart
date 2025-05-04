import { NextResponse } from "next/server"
import { getGoogleOAuthConfig, getBaseUrl, getAuthRedirectUris } from "@/lib/oauth-config"

export async function GET() {
  // Only enable in development or with explicit permission
  if (process.env.NODE_ENV !== "development" && process.env.ENABLE_DEBUG_ENDPOINTS !== "true") {
    return NextResponse.json({ error: "Debug endpoints are disabled in production" }, { status: 403 })
  }

  const googleConfig = getGoogleOAuthConfig()

  return NextResponse.json({
    baseUrl: getBaseUrl(),
    googleOAuth: {
      isConfigured: googleConfig.isConfigured,
      redirectUri: googleConfig.redirectUri,
      clientIdConfigured: Boolean(googleConfig.clientId),
      clientSecretConfigured: Boolean(googleConfig.clientSecret),
    },
    possibleRedirectUris: getAuthRedirectUris(),
    environment: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "(not set)",
      VERCEL_URL: process.env.VERCEL_URL || "(not set)",
      NODE_ENV: process.env.NODE_ENV,
    },
  })
}
