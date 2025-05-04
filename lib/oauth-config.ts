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
  // For heartgudie3.vercel.app (note the spelling)
  return `https://heartgudie3.vercel.app/api/auth/${provider}/callback`
}

/**
 * Lists all redirect URIs that should be configured in the Google Cloud Console
 */
export function getAuthRedirectUris() {
  return [
    "https://heartgudie3.vercel.app/api/auth/google/callback",
    "https://heartguide3.vercel.app/api/auth/google/callback", // alternate spelling
    "http://localhost:3000/api/auth/google/callback",
  ]
}
