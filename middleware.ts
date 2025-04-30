import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define paths that don't require authentication
const publicPaths = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-reset-code",
  "/otp-verification",
  "/",
  "/landing",
  "/new-landing",
  "/about",
  "/how-it-works",
  "/legal",
  "/product",
  "/company",
  "/social",
  "/contact",
]

// Define paths that require admin role
const adminPaths = ["/admin", "/admin-login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get("session")?.value

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))

  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // If no session token exists and the path is not public, redirect to login
  if (!sessionToken) {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  // For admin paths, additional checks would be needed
  // This is a simplified version

  // Allow access to protected routes for authenticated users
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
