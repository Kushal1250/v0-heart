import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getUserProfile, normalizeUserData, handleSocialLogin } from "@/lib/social-auth"

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code and state from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    // Verify state parameter to prevent CSRF attacks
    const storedState = request.cookies.get("github_oauth_state")?.value

    if (!storedState || state !== storedState) {
      console.error("GitHub OAuth state mismatch", { state, storedState })
      return NextResponse.redirect(new URL("/signup?error=github_state_mismatch", request.url))
    }

    if (!code) {
      console.error("No GitHub authorization code provided")
      return NextResponse.redirect(new URL("/signup?error=github_no_code", request.url))
    }

    // Exchange the code for an access token
    const tokenData = await exchangeCodeForToken("github", code)

    if (!tokenData.access_token) {
      console.error("GitHub token error:", tokenData)
      return NextResponse.redirect(new URL("/signup?error=github_token_error", request.url))
    }

    // Get user profile using the access token
    const userData = await getUserProfile("github", tokenData.access_token)

    if (!userData || !userData.id) {
      console.error("GitHub user data error:", userData)
      return NextResponse.redirect(new URL("/signup?error=github_user_data_error", request.url))
    }

    // Normalize the user data
    const normalizedUserData = normalizeUserData("github", userData)

    if (!normalizedUserData.email) {
      console.error("GitHub email missing:", normalizedUserData)
      return NextResponse.redirect(new URL("/signup?error=github_email_missing", request.url))
    }

    // Handle the login/registration process
    const result = await handleSocialLogin(normalizedUserData)

    if (result.success) {
      // Clear the state cookie
      const response = NextResponse.redirect(new URL("/dashboard", request.url))
      response.cookies.delete("github_oauth_state")
      return response
    } else {
      console.error("GitHub login failed:", result.error)
      return NextResponse.redirect(
        new URL(
          `/signup?error=github_login_failed&message=${encodeURIComponent(result.error || "Unknown error")}`,
          request.url,
        ),
      )
    }
  } catch (error: any) {
    console.error("GitHub callback error:", error)
    const errorMessage = encodeURIComponent(error.message || "Unknown error")
    return NextResponse.redirect(new URL(`/signup?error=github_auth_failed&message=${errorMessage}`, request.url))
  }
}
