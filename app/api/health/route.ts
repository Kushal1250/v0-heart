import { NextResponse } from "next/server"

export async function GET() {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "HeartGuard AI",
    version: "1.0.0",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    features: {
      seo: "enabled",
      sitemap: "enabled",
      structuredData: "enabled",
      analytics: "enabled",
    },
  }

  return NextResponse.json(healthCheck, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  })
}
