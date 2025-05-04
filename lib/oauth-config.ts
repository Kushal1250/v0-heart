/**
 * OAuth Configuration Helper
 * Ensures consistent OAuth configuration across the application
 */

/**
 * Gets the exact redirect URI to use for OAuth providers
 * @param provider The OAuth provider (google, facebook, github)
 * @returns The properly formatted redirect URI
 */
export function getRedirectUri(provider: string) {
  // Get the base URL from environment variable or use a default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/api/auth/${provider}/callback`
}

/**
 * Lists all redirect URIs that should be configured in the Google Cloud Console
 */
export function getAuthRedirectUris() {
  return [
    "https://heartguide3.vercel.app/api/auth/google/callback",
    "https://heart-disease-predictor.vercel.app/api/auth/google/callback",
    "http://localhost:3000/api/auth/google/callback",
  ]
}
