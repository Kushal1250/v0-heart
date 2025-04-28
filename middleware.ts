import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/login" ||
    path === "/signup" ||
    path === "/admin-login" ||
    path.startsWith("/api/auth/") ||
    path.includes(".")

  // API paths that should bypass the middleware
  const isApiPath = path.startsWith("/api/") && !path.startsWith("/api/admin/")

  // Admin paths that require admin authentication
  const isAdminPath = path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/admin/")

  // Get the token from the cookies
  const token = request.cookies.get("token")?.value || ""
  const sessionToken = request.cookies.get("session")?.value || ""
  const isAdmin = request.cookies.get("is_admin")?.value === "true"

  // Use either token or session token
  const hasToken = token || sessionToken

  // If the path is public or a non-admin API, allow access
  if (isPublicPath || isApiPath) {
    return NextResponse.next()
  }

  // If trying to access admin paths
  if (isAdminPath) {
    // Check if user is an admin
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }
  }

  // If user is not authenticated and trying to access protected pages
  if (!hasToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect authenticated users to dashboard if they try to access login/signup
  if (hasToken && (path === "/login" || path === "/signup" || path === "/admin-login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow access to protected routes for authenticated users
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
