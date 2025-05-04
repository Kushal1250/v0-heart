/**
 * OAuth Configuration for Production Deployment
 */

/**
 * Gets the base URL for the application
 * Used for constructing redirect URIs and other URLs
 */
export function getBaseUrl() {
  // First priority: explicitly set APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.trim()
  }

  // Second priority: Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback for local development
  return "http://localhost:3000"
}

/**
 * Gets the exact redirect URI to use for OAuth providers
 */
export function getRedirectUri(provider: string) {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/api/auth/${provider}/callback`
}

/**
 * Gets all possible redirect URIs that should be configured in OAuth provider dashboards
 */
export function getAuthRedirectUris() {
  return [
    `http://localhost:3000/api/auth/google/callback`,
    `https://heartguide3.vercel.app/api/auth/google/callback`,
    `https://heartguide2.vercel.app/api/auth/google/callback`,
    `https://heartguide.vercel.app/api/auth/google/callback`,
  ]
}

/**
 * Gets the Google OAuth configuration
 * Used for initializing the Google OAuth client
 */
export function getGoogleOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: getRedirectUri("google"),
    scopes: ["profile", "email"],
  }
}
