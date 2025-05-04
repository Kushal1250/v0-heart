/**
 * OAuth Configuration Helper
 * Ensures consistent OAuth configuration across the application
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
 * @param provider The OAuth provider (google, facebook, github)
 * @returns The properly formatted redirect URI
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
    `https://heart-disease-predictor.vercel.app/api/auth/google/callback`,
    // Add any other deployment URLs you might use
  ]
}

/**
 * Gets the Google OAuth configuration
 * Used for initializing the Google OAuth client
 */
export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID || ""
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ""

  return {
    clientId,
    clientSecret,
    redirectUri: getRedirectUri("google"),
    isConfigured: Boolean(clientId && clientSecret),
  }
}
