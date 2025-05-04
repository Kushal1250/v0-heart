import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// Database connection
const sql = neon(process.env.DATABASE_URL!)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET_KEY || "your-fallback-secret-key"

/**
 * Gets the base URL for the current environment
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser environment
    return window.location.origin
  }

  // Server environment
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Default fallback
  return "http://localhost:3000"
}

/**
 * Get provider-specific OAuth configuration
 */
export function getProviderConfig(provider: string) {
  switch (provider) {
    case "github":
      return {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        authUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        userUrl: "https://api.github.com/user",
        emailUrl: "https://api.github.com/user/emails",
        redirectUri: `${getBaseUrl()}/api/auth/github/callback`,
        scope: "read:user user:email",
      }
    case "google":
      return {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
        redirectUri: `${getBaseUrl()}/api/auth/google/callback`,
        scope: "profile email",
      }
    case "facebook":
      return {
        clientId: process.env.FACEBOOK_CLIENT_ID || "",
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
        userUrl: "https://graph.facebook.com/v18.0/me?fields=id,name,email,picture",
        redirectUri: `${getBaseUrl()}/api/auth/facebook/callback`,
        scope: "email,public_profile",
      }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

/**
 * Generate the authorization URL for a provider
 */
export function getProviderAuthUrl(provider: string): string {
  const config = getProviderConfig(provider)

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: "code",
  })

  console.log(`${provider} OAuth redirect URI:`, config.redirectUri)

  return `${config.authUrl}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(provider: string, code: string): Promise<any> {
  const config = getProviderConfig(provider)

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  })

  return await response.json()
}

/**
 * Get user profile from provider
 */
export async function getUserProfile(provider: string, accessToken: string): Promise<any> {
  const config = getProviderConfig(provider)

  const response = await fetch(config.userUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const userData = await response.json()

  // For GitHub, email might be private, so we need to fetch it separately
  if (provider === "github" && !userData.email) {
    const emailsResponse = await fetch(config.emailUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const emails = await emailsResponse.json()
    const primaryEmail = emails.find((email: any) => email.primary)
    userData.email = primaryEmail ? primaryEmail.email : emails[0]?.email
  }

  return userData
}

/**
 * Normalize user data from different providers
 */
export function normalizeUserData(provider: string, userData: any): any {
  switch (provider) {
    case "github":
      return {
        provider,
        providerId: userData.id.toString(),
        name: userData.name || userData.login,
        email: userData.email,
        avatar: userData.avatar_url,
      }
    case "google":
      return {
        provider,
        providerId: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.picture,
      }
    case "facebook":
      return {
        provider,
        providerId: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.picture?.data?.url,
      }
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

/**
 * Handle social login/registration
 */
export async function handleSocialLogin(userData: {
  provider: string
  providerId: string
  name: string
  email: string
  avatar?: string
}): Promise<any> {
  try {
    // Check if user exists
    const existingUser = await getUserByEmail(userData.email)

    if (existingUser) {
      // User exists, update provider info if needed
      const user = existingUser

      // If user exists but with different provider, link accounts
      if (user.provider !== userData.provider || user.provider_id !== userData.providerId) {
        await sql`
          UPDATE users 
          SET provider = ${userData.provider}, provider_id = ${userData.providerId}, updated_at = NOW() 
          WHERE id = ${user.id}
        `
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
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

      return { success: true, user }
    } else {
      // Create new user
      const newUser = await sql`
        INSERT INTO users (name, email, provider, provider_id, profile_picture, created_at, updated_at) 
        VALUES (${userData.name}, ${userData.email}, ${userData.provider}, ${userData.providerId}, ${userData.avatar || null}, NOW(), NOW()) 
        RETURNING *
      `

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
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

      return { success: true, user: newUser[0] }
    }
  } catch (error) {
    console.error("Error handling social login:", error)
    return { success: false, error: "Authentication failed" }
  }
}

async function getUserByEmail(email: string): Promise<any | null> {
  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Database error in getUserByEmail:", error)
    return null
  }
}

// Helper function to handle social login
export async function handleSocialLoginLegacy(userData: {
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
