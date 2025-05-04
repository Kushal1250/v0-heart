/**
 * OAuth Configuration Helper
 *
 * This file provides consistent OAuth configuration across the application
 */

/**
 * Gets the correct redirect URI for the current environment
 * @param provider The OAuth provider (google, facebook, github)
 * @param req The Next.js request object (optional)
 * @returns The properly formatted redirect URI
 */
export function getRedirectUri(provider: string, req?: Request) {
  // Try to get the host from the request
  let host = ""
  if (req) {
    const headers = new Headers(req.headers)
    host = headers.get("host") || ""
  }

  // Fallback to environment variables if no host in request
  if (!host) {
    // Check for Vercel environment first
    if (process.env.VERCEL_URL) {
      host = process.env.VERCEL_URL
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      // Strip protocol if present
      host = process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, "")
    } else {
      host = "localhost:3000"
    }
  }

  // Special case for heartgudie3.vercel.app (note the "gudie" spelling)
  if (host.includes("heartgudie3")) {
    host = "heartgudie3.vercel.app"
  }

  // Determine protocol - always use HTTPS for production
  const protocol = host.includes("localhost") ? "http" : "https"

  // Return the full redirect URI
  return `${protocol}://${host}/api/auth/${provider}/callback`
}

/**
 * Gets all possible redirect URIs that should be configured in OAuth provider dashboards
 * This helps developers ensure all necessary URIs are configured
 *
 * @param provider The OAuth provider (google, facebook, github)
 * @returns Array of possible redirect URIs
 */
export function getPossibleRedirectUris(provider: string) {
  return [
    `https://heartgudie3.vercel.app/api/auth/${provider}/callback`, // Note the spelling
    `https://heartguide3.vercel.app/api/auth/${provider}/callback`,
    `https://heart-disease-predictor.vercel.app/api/auth/${provider}/callback`,
    `http://localhost:3000/api/auth/${provider}/callback`,
  ]
}
