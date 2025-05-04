/**
 * OAuth Configuration Helper
 * Ensures consistent OAuth configuration across the application
 */

// IMPORTANT: This must match EXACTLY what's configured in Google Cloud Console
const GOOGLE_REDIRECT_URI = "https://heart-disease-predictor.vercel.app/api/auth/google/callback"

/**
 * Gets the exact redirect URI to use for OAuth providers
 * @param provider The OAuth provider (google, facebook, github)
 * @returns The properly formatted redirect URI
 */
export function getRedirectUri(provider: string) {
  if (provider === "google") {
    // Always use the hardcoded URI for Google
    return GOOGLE_REDIRECT_URI
  }

  // For other providers, use the environment variable
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/api/auth/${provider}/callback`
}

/**
 * Lists all redirect URIs that should be configured in the Google Cloud Console
 */
export function getAuthRedirectUris() {
  return [GOOGLE_REDIRECT_URI, "http://localhost:3000/api/auth/google/callback"]
}
