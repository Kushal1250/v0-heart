import { NextResponse } from "next/server"
import { getAuthRedirectUris, getRedirectUri } from "@/lib/oauth-config"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const vercelUrl = process.env.VERCEL_URL || "Not available"
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "..." || "Not configured"

    // Get all the URIs that should be configured
    const configuredUris = getAuthRedirectUris()
    const currentUri = getRedirectUri("google")

    return NextResponse.json({
      status: "success",
      message: "OAuth configuration debug information",
      config: {
        baseUrl,
        vercelUrl,
        googleClientId: googleClientId,
        googleClientIdConfigured: !!process.env.GOOGLE_CLIENT_ID,
        googleClientSecretConfigured: !!process.env.GOOGLE_CLIENT_SECRET,
        currentRedirectUri: currentUri,
        recommendedRedirectUris: configuredUris,
      },
      instructions: `
        1. Go to Google Cloud Console: https://console.cloud.google.com/
        2. Navigate to APIs & Services > Credentials
        3. Edit your OAuth 2.0 Client ID
        4. Under "Authorized redirect URIs", add EXACTLY: ${currentUri}
        5. Click Save
        6. Wait a few minutes for changes to propagate
        7. Try signing in again
      `,
    })
  } catch (error) {
    console.error("OAuth debug error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to get OAuth debug information",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
