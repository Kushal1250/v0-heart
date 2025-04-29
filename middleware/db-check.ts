import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set")

    // Only redirect to error page if not already on error page and not an API route
    if (!request.nextUrl.pathname.startsWith("/api/") && !request.nextUrl.pathname.includes("/error")) {
      return NextResponse.redirect(new URL("/error?code=db_missing", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply this middleware to all routes except static files and error page
    "/((?!_next/static|_next/image|favicon.ico|error).*)",
  ],
}
