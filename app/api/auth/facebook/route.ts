import { type NextRequest, NextResponse } from "next/server"
import { getProviderAuthUrl } from "@/lib/social-auth"

export async function GET(request: NextRequest) {
  try {
    // Get the Facebook auth URL with proper configuration
    const authUrl = getProviderAuthUrl("facebook")
    console.log("Redirecting to Facebook auth URL:", authUrl)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Facebook auth error:", error)
    // Redirect to error page with more specific error information
    return NextResponse.redirect(
      new URL(
        `/signup?error=facebook_auth_failed&message=${encodeURIComponent(error.message || "Unknown error")}`,
        request.url,
      ),
    )
  }
}
