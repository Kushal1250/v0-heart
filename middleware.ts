import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuth } from "./lib/auth-utils"

export async function middleware(request: NextRequest) {
  // Check if the request is for the admin area
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
  const isApiRoute = request.nextUrl.pathname.startsWith("/api")
  const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth")
  const isAdminApiRoute = request.nextUrl.pathname.startsWith("/api/admin")

  // Skip middleware for public assets and API routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes("/api/auth") ||
    request.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Check for maintenance mode (except for admin routes and auth routes)
  if (!isAdminRoute && !isAuthRoute) {
    try {
      const maintenanceResponse = await fetch(`${request.nextUrl.origin}/api/admin/maintenance-status`, {
        cache: "no-store",
      })

      if (maintenanceResponse.ok) {
        const { maintenanceMode } = await maintenanceResponse.json()

        if (maintenanceMode && !isAdminRoute && !isAdminApiRoute) {
          return NextResponse.redirect(new URL("/maintenance", request.url))
        }
      }
    } catch (error) {
      console.error("Error checking maintenance mode:", error)
      // Continue if there's an error checking maintenance mode
    }
  }

  // For admin routes, verify authentication
  if (isAdminRoute && request.nextUrl.pathname !== "/admin-login") {
    const authResult = await verifyAuth(request)

    if (!authResult.isAuthenticated) {
      // Store the original URL to redirect back after login
      const url = new URL("/admin-login", request.url)
      url.searchParams.set("callbackUrl", request.nextUrl.pathname)

      // Log the redirect for debugging
      console.log(`Redirecting unauthenticated user from ${request.nextUrl.pathname} to ${url.pathname}`)

      return NextResponse.redirect(url)
    }

    // Refresh the session token to extend its validity
    const response = NextResponse.next()

    // Set a custom header to indicate the session was checked
    response.headers.set("x-session-checked", "true")

    // Add the user's role to the headers for use in the application
    if (authResult.user?.role) {
      response.headers.set("x-user-role", authResult.user.role)
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth/session-debug|_next/static|_next/image|favicon.ico).*)"],
}
