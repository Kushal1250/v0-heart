import { type NextRequest, NextResponse } from "next/server"
import { getAuthRedirectUris } from "@/lib/oauth-config"

export async function GET(request: NextRequest) {
  // Only available in development mode
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const host = request.headers.get("host") || "unknown"
  const referer = request.headers.get("referer") || "unknown"

  return NextResponse.json({
    currentHost: host,
    referer: referer,
    clientId: process.env.GOOGLE_CLIENT_ID ? "configured" : "missing",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "configured" : "missing",
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    vercelUrl: process.env.VERCEL_URL,
    authRedirectUris: getAuthRedirectUris(),
    fixedRedirectUri: `https://heartgudie3.vercel.app/api/auth/google/callback`,
  })
}
