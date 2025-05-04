import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getUserProfile, normalizeUserData, handleSocialLogin } from "@/lib/social-auth"
import { getBaseUrl } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  try {
    // Log the callback URL for debugging
    console.log("GitHub callback URL:", request.url)

    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code) {
      throw new Error("No authorization code provided")
    }

    // Log the code for debugging (redacted for security)
    console.log("GitHub auth code received:", code.substring(0, 5) + "...")

    // Exchange the code for an access token
    const tokenData = await exchangeCodeForToken("github", code)

    if (!tokenData.access_token) {
      console.error("GitHub token error:", tokenData)
      throw new Error("Failed to get access token")
    }

    // Log token received (redacted for security)
    console.log("GitHub access token received:", tokenData.access_token.substring(0, 5) + "...")

    // Get user profile using the access token
    const userData = await getUserProfile("github", tokenData.access_token)

    // Normalize the user data
    const normalizedUserData = normalizeUserData("github", userData)

    // Handle the login/registration process
    const result = await handleSocialLogin(normalizedUserData)

    if (result.success) {
      // Create a JWT token or session
      // This is a placeholder - implement your actual session creation

      // Redirect to dashboard after successful login
      return NextResponse.redirect(new URL("/dashboard", getBaseUrl()))
    } else {
      throw new Error(result.error || "Authentication failed")
    }
  } catch (error) {
    console.error("GitHub callback error:", error)
    return NextResponse.redirect(new URL("/signup?error=github_auth_failed", getBaseUrl()))
  }
}
