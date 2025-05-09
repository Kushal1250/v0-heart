import { cookies } from "next/headers"

/**
 * Get session token from cookies - App Router only
 */
export function getAppSessionToken(): string | undefined {
  return cookies().get("session")?.value
}

/**
 * Clear session cookie - App Router only
 */
export function clearAppSessionCookie(): void {
  cookies().delete("session")
}

/**
 * Create response with cookie - App Router only
 */
export function createAppResponseWithCookie(data: any, token: string): Response {
  const response = new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })

  // Set cookie with proper configuration
  response.headers.set(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`, // 24 hours
  )

  return response
}
