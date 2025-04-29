import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionByToken } from "@/lib/db"

// Define which paths require authentication
const authRequiredPaths = [
  "/dashboard",
  "/profile",
  "/settings",
  "/predict/results",
  // "/history" - Removed from protected routes
]

// Define which paths require admin role
const adminRequiredPaths = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Special case for admin paths
  if (adminRequiredPaths.some((path) => pathname.startsWith(path))) {
    // Check for admin cookie first (client-side auth)
    const isAdminCookie = request.cookies.get("is_admin")?.value

    if (isAdminCookie === "true") {
      // Admin cookie is present, allow access
      return NextResponse.next()
    }

    // No admin cookie, redirect to admin login
    return NextResponse.redirect(new URL("/admin-login", request.url))
  }

  // Handle regular auth paths
  if (authRequiredPaths.some((path) => pathname.startsWith(path))) {
    // Get the session token from the cookie
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      // No session token, redirect to login
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    try {
      // Verify the session token
      const session = await getSessionByToken(sessionToken)

      if (!session || new Date(session.expires_at) < new Date()) {
        // Invalid or expired session, redirect to login
        const url = new URL("/login", request.url)
        url.searchParams.set("redirect", pathname)
        return NextResponse.redirect(url)
      }

      // Session is valid, continue
      return NextResponse.next()
    } catch (error) {
      console.error("Error in middleware:", error)
      // Error occurred, redirect to login
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }

  // No authentication required for this path, continue
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/predict/results/:path*",
    // "/history/:path*" - Removed from matcher
  ],
}
