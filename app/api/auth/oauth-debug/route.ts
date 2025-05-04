import { NextResponse } from "next/server"
import { getAuthRedirectUris, getRedirectUri } from "@/lib/oauth-config"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "..." || "Not configured"

    // Get all the URIs that should be configured
    const configuredUris = getAuthRedirectUris()
    const currentUri = getRedirectUri("google")

    return NextResponse.json({
      status: "success",
      message: "OAuth configuration debug information",
      config: {
        baseUrl,
        googleClientId: googleClientId,
        googleClientIdConfigured: !!process.env.GOOGLE_CLIENT_ID,
        googleClientSecretConfigured: !!process.env.GOOGLE_CLIENT_SECRET,
        currentRedirectUri: currentUri,
        recommendedRedirectUris: configuredUris,
      },
      instructions: "Add ALL the recommendedRedirectUris to your Google Cloud Console OAuth configuration",
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
