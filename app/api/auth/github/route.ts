import { type NextRequest, NextResponse } from "next/server"
import { getProviderAuthUrl } from "@/lib/social-auth"

export async function GET(request: NextRequest) {
  try {
    // Log the request URL for debugging
    console.log("GitHub OAuth request URL:", request.url)

    // Get the authorization URL
    const authUrl = getProviderAuthUrl("github")

    // Log the authorization URL for debugging
    console.log("GitHub authorization URL:", authUrl)

    // Redirect to GitHub for authorization
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("GitHub auth error:", error)
    return NextResponse.redirect(new URL("/signup?error=auth_failed", request.url))
  }
}
