import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// Database connection
const sql = neon(process.env.DATABASE_URL!)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET_KEY || "your-fallback-secret-key"

// Helper function to handle social login
export async function handleSocialLogin(userData: {
  provider: string
  providerId: string
  name: string
  email: string
  profilePicture?: string
}) {
  try {
    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${userData.email}
    `

    let userId

    if (existingUser.length === 0) {
      // Create new user
      const newUser = await sql`
        INSERT INTO users (
          name, 
          email, 
          provider, 
          provider_id,
          profile_picture,
          created_at
        ) 
        VALUES (
          ${userData.name}, 
          ${userData.email}, 
          ${userData.provider}, 
          ${userData.providerId},
          ${userData.profilePicture || null},
          NOW()
        )
        RETURNING id
      `
      userId = newUser[0].id
    } else {
      userId = existingUser[0].id

      // Update provider info if needed
      await sql`
        UPDATE users 
        SET 
          provider = ${userData.provider},
          provider_id = ${userData.providerId},
          profile_picture = COALESCE(${userData.profilePicture}, profile_picture)
        WHERE id = ${userId}
      `
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId,
        email: userData.email,
        name: userData.name,
        provider: userData.provider,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Set cookie
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
      sameSite: "lax",
    })

    return { success: true, userId }
  } catch (error) {
    console.error("Social login error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

// Helper function to get provider-specific URLs
export function getProviderAuthUrl(provider: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/${provider}/callback`

  switch (provider) {
    case "google":
      const googleClientId = process.env.GOOGLE_CLIENT_ID
      const googleScope =
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(googleScope)}&access_type=offline`

    case "facebook":
      const facebookClientId = process.env.FACEBOOK_CLIENT_ID
      const facebookScope = "email,public_profile"
      return `https://www.facebook.com/v12.0/dialog/oauth?client_id=${facebookClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${facebookScope}`

    case "github":
      const githubClientId = process.env.GITHUB_CLIENT_ID
      const githubScope = "user:email"
      return `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${githubScope}`

    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

// Helper function to exchange auth code for tokens
export async function exchangeCodeForToken(provider: string, code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/${provider}/callback`

  try {
    let tokenResponse

    switch (provider) {
      case "google":
        tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        })
        break

      case "facebook":
        tokenResponse = await fetch("https://graph.facebook.com/v12.0/oauth/access_token", {
          method: "GET",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          cache: "no-store",
        })
        break

      case "github":
        tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: redirectUri,
          }),
        })
        break

      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    if (!tokenResponse.ok) {
      throw new Error(`Failed to exchange code: ${tokenResponse.statusText}`)
    }

    return await tokenResponse.json()
  } catch (error) {
    console.error(`Error exchanging code for ${provider}:`, error)
    throw error
  }
}

// Helper function to get user profile from provider
export async function getUserProfile(provider: string, accessToken: string) {
  try {
    let userResponse

    switch (provider) {
      case "google":
        userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        break

      case "facebook":
        userResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
        )
        break

      case "github":
        userResponse = await fetch("https://api.github.com/user", {
          headers: { Authorization: `token ${accessToken}` },
        })
        break

      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    if (!userResponse.ok) {
      throw new Error(`Failed to get user profile: ${userResponse.statusText}`)
    }

    const userData = await userResponse.json()

    // Get email from GitHub if not included in user data
    if (provider === "github" && !userData.email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `token ${accessToken}` },
      })

      if (emailsResponse.ok) {
        const emails = await emailsResponse.json()
        const primaryEmail = emails.find((email: any) => email.primary)
        if (primaryEmail) {
          userData.email = primaryEmail.email
        }
      }
    }

    return userData
  } catch (error) {
    console.error(`Error getting user profile from ${provider}:`, error)
    throw error
  }
}

// Helper function to normalize user data from different providers
export function normalizeUserData(provider: string, userData: any) {
  switch (provider) {
    case "google":
      return {
        provider: "google",
        providerId: userData.id,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.picture,
      }

    case "facebook":
      return {
        provider: "facebook",
        providerId: userData.id,
        name: userData.name,
        email: userData.email,
        profilePicture: userData.picture?.data?.url,
      }

    case "github":
      return {
        provider: "github",
        providerId: userData.id.toString(),
        name: userData.name || userData.login,
        email: userData.email,
        profilePicture: userData.avatar_url,
      }

    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}
