import { NextResponse } from "next/server"
import { getBaseUrl } from "@/lib/social-auth"

export async function GET() {
  try {
    const baseUrl = getBaseUrl()
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`

    // Extract domain from baseUrl
    const url = new URL(baseUrl)
    const domain = url.hostname

    return NextResponse.json({
      clientId: !!process.env.FACEBOOK_CLIENT_ID,
      clientSecret: !!process.env.FACEBOOK_CLIENT_SECRET,
      redirectUri,
      baseUrl,
      domain,
    })
  } catch (error) {
    console.error("Error checking Facebook OAuth status:", error)
    return NextResponse.json(
      {
        clientId: false,
        clientSecret: false,
        redirectUri: "",
        baseUrl: "",
        error: error.message || "Failed to check Facebook OAuth status",
      },
      { status: 500 },
    )
  }
}
