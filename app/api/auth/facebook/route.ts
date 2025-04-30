import { type NextRequest, NextResponse } from "next/server"
import { getProviderAuthUrl } from "@/lib/social-auth"

export async function GET(request: NextRequest) {
  try {
    const authUrl = getProviderAuthUrl("facebook")
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Facebook auth error:", error)
    return NextResponse.redirect(new URL("/signup?error=auth_failed", request.url))
  }
}
