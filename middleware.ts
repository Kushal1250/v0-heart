import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protection
  if (pathname.startsWith("/admin") && pathname !== "/admin-login") {
    const isAdmin = request.cookies.get("is_admin")?.value === "true"
    const hasSession = request.cookies.get("session")?.value || request.cookies.get("admin_session")?.value

    console.log("Admin route access attempt:", {
      pathname,
      isAdmin,
      hasSession: !!hasSession,
    })

    if (!isAdmin || !hasSession) {
      console.log("Redirecting to admin login - missing admin credentials")
      const loginUrl = new URL("/admin-login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect admin login if already authenticated
  if (pathname === "/admin-login") {
    const isAdmin = request.cookies.get("is_admin")?.value === "true"
    const hasSession = request.cookies.get("session")?.value || request.cookies.get("admin_session")?.value

    if (isAdmin && hasSession) {
      console.log("Already authenticated admin, redirecting to dashboard")
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/admin-login"],
}
