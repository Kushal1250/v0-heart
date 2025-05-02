import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionByToken, getUserById } from "@/lib/db"

// Define which paths require authentication
const authRequiredPaths = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
  "/predict/results",
  // "/history" - Removed from protected routes
]

// Define which paths require admin role
const adminRequiredPaths = ["/admin"]

// Define paths that should be accessible whether logged in or not
const publicAccessPaths = ["/home", "/predict", "/history", "/about", "/how-it-works"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is in the public access list
  const isPublicAccessPath = publicAccessPaths.some((path) => pathname.startsWith(path))

  // If it's a public access path, allow access without authentication check
  if (isPublicAccessPath) {
    return NextResponse.next()
  }

  // Check if the path requires authentication
  const isAuthRequired = authRequiredPaths.some((path) => pathname.startsWith(path))
  const isAdminRequired = adminRequiredPaths.some((path) => pathname.startsWith(path))

  if (isAuthRequired || isAdminRequired) {
    // Get the session token from the cookie
    const sessionToken = request.cookies.get("session")?.value
    const isAdminCookie = request.cookies.get("is_admin")?.value === "true"

    // Special case for admin paths
    if (isAdminRequired && isAdminCookie) {
      // If is_admin cookie is set, allow access to admin paths
      return NextResponse.next()
    }

    if (!sessionToken) {
      // No session token, redirect to login
      const url = new URL(isAdminRequired ? "/admin-login" : "/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    try {
      // Verify the session token
      const session = await getSessionByToken(sessionToken)

      if (!session) {
        // Invalid session, redirect to login
        const url = new URL(isAdminRequired ? "/admin-login" : "/login", request.url)
        url.searchParams.set("redirect", pathname)
        return NextResponse.redirect(url)
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        // Session expired, redirect to login
        const url = new URL(isAdminRequired ? "/admin-login" : "/login", request.url)
        url.searchParams.set("redirect", pathname)
        url.searchParams.set("expired", "true")
        return NextResponse.redirect(url)
      }

      // If admin role is required, check the user's role
      if (isAdminRequired) {
        const user = await getUserById(session.user_id)

        if (!user || user.role !== "admin") {
          // User is not an admin, redirect to unauthorized page
          return NextResponse.redirect(new URL("/unauthorized", request.url))
        }
      }

      // Session is valid, continue
      return NextResponse.next()
    } catch (error) {
      console.error("Error in middleware:", error)
      // Error occurred, redirect to login
      const url = new URL(isAdminRequired ? "/admin-login" : "/login", request.url)
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
    // Include the public access paths in the matcher
    "/home/:path*",
    "/predict/:path*",
    "/history/:path*",
    "/about/:path*",
    "/how-it-works/:path*",
  ],
}
