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
  "/history", // Add history to protected routes
]

// Define which paths require admin role
const adminRequiredPaths = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path requires authentication
  const isAuthRequired = authRequiredPaths.some((path) => pathname.startsWith(path))
  const isAdminRequired = adminRequiredPaths.some((path) => pathname.startsWith(path))

  if (isAuthRequired || isAdminRequired) {
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
    "/history/:path*", // Add history to the matcher
  ],
}
