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

// Define paths that are exempt from authentication checks
const authExemptPaths = ["/admin-login", "/login", "/signup", "/forgot-password"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Skip middleware for auth exempt paths
  if (authExemptPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

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
      console.log("Admin access granted via is_admin cookie")
      return NextResponse.next()
    }

    if (!sessionToken) {
      // No session token, redirect to login
      console.log("No session token, redirecting to login")
      const url = new URL(isAdminRequired ? "/admin-login" : "/login", request.url)
      url.searchParams.set("redirect", pathname)

      // Add a cache-busting parameter to prevent redirect loops
      url.searchParams.set("t", Date.now().toString())

      return NextResponse.redirect(url)
    }

    try {
      // Verify the session token
      const session = await getSessionByToken(sessionToken)

      if (!session) {
        // Invalid session, redirect to login
        console.log("Invalid session, redirecting to login")
        const url = new URL(isAdminRequired ? "/admin-login" : "/login", request.url)
        url.searchParams.set("redirect", pathname)
        url.searchParams.set("expired", "true")

        // Add a cache-busting parameter to prevent redirect loops
        url.searchParams.set("t", Date.now().toString())

        return NextResponse.redirect(url)
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        // Session expired, redirect to login
        console.log("Session expired, redirecting to login")
        const url = new URL(isAdminRequired ? "/admin-login" : "/login", request.url)
        url.searchParams.set("redirect", pathname)
        url.searchParams.set("expired", "true")

        // Add a cache-busting parameter to prevent redirect loops
        url.searchParams.set("t", Date.now().toString())

        return NextResponse.redirect(url)
      }

      // If admin role is required, check the user's role
      if (isAdminRequired) {
        const user = await getUserById(session.user_id)

        if (!user || user.role !== "admin") {
          // User is not an admin, redirecting to unauthorized page
          console.log("User is not an admin, redirecting to unauthorized")
          return NextResponse.redirect(new URL("/unauthorized", request.url))
        }

        // Set the is_admin cookie to avoid repeated DB lookups
        const response = NextResponse.next()
        response.cookies.set("is_admin", "true", {
          httpOnly: false,
          path: "/",
          maxAge: 24 * 60 * 60, // 1 day
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })

        return response
      }

      // Session is valid, continue
      return NextResponse.next()
    } catch (error) {
      console.error("Error in middleware:", error)
      // Error occurred, redirect to login
      const url = new URL(isAdminRequired ? "/admin-login" : "/login", request.url)
      url.searchParams.set("redirect", pathname)

      // Add a cache-busting parameter to prevent redirect loops
      url.searchParams.set("t", Date.now().toString())

      return NextResponse.redirect(url)
    }
  }

  // No authentication required for this path, continue
  return NextResponse.next()
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
