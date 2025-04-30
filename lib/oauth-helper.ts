/**
 * OAuth Helper Functions
 *
 * This file contains utility functions for OAuth authentication
 */

/**
 * Gets the base URL for the current environment
 * @returns The base URL (e.g., http://localhost:3000 or https://heartguide3.vercel.app)
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
 * Gets the redirect URI for OAuth callbacks
 * @param provider The OAuth provider (google, facebook, github)
 * @returns The full redirect URI
 */
export function getRedirectUri(provider: string) {
  return `${getBaseUrl()}/api/auth/${provider}/callback`
}

/**
 * Gets all possible redirect URIs that should be configured in OAuth provider dashboards
 * @param provider The OAuth provider (google, facebook, github)
 * @returns Array of possible redirect URIs
 */
export function getPossibleRedirectUris(provider: string) {
  return [
    `http://localhost:3000/api/auth/${provider}/callback`,
    `https://heartguide3.vercel.app/api/auth/${provider}/callback`,
    `https://heartguide2.vercel.app/api/auth/${provider}/callback`,
    `https://heartguide.vercel.app/api/auth/${provider}/callback`,
  ]
}
