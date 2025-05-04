import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getUserProfile, normalizeUserData, handleSocialLogin } from "@/lib/social-auth"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const error = searchParams.get("error")
    const errorReason = searchParams.get("error_reason")
    const errorDescription = searchParams.get("error_description")

    // Handle errors returned from Facebook
    if (error) {
      console.error("Facebook returned an error:", { error, errorReason, errorDescription })
      throw new Error(`Facebook auth error: ${errorDescription || errorReason || error}`)
    }

    if (!code) {
      throw new Error("No authorization code provided")
    }

    console.log("Received Facebook auth code, exchanging for token...")

    // Exchange the code for access token
    const tokenData = await exchangeCodeForToken("facebook", code)

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token")
    }

    console.log("Successfully obtained Facebook access token, fetching user profile...")

    // Get user profile using the access token
    const userData = await getUserProfile("facebook", tokenData.access_token)

    // Normalize the user data
    const normalizedUserData = normalizeUserData("facebook", userData)

    console.log("Successfully fetched and normalized Facebook user data, handling login...")

    // Handle the login/registration process
    const result = await handleSocialLogin(normalizedUserData)

    if (result.success) {
      // Redirect to dashboard or home page after successful login
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      throw new Error(result.error || "Authentication failed")
    }
  } catch (error) {
    console.error("Facebook callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/signup?error=facebook_auth_failed&message=${encodeURIComponent(error.message || "Unknown error")}`,
        request.url,
      ),
    )
  }
}
