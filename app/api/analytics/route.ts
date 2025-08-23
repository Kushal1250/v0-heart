import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, category, label, value, userId } = body

    // Log analytics event (in production, send to your analytics service)
    console.log("[v0] Analytics Event:", {
      event,
      category,
      label,
      value,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
      ip: request.ip || request.headers.get("x-forwarded-for"),
    })

    // Here you would typically send to your analytics service
    // await sendToAnalyticsService({ event, category, label, value, userId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}

export async function GET() {
  // Return analytics health check
  return NextResponse.json({
    status: "healthy",
    service: "analytics",
    timestamp: new Date().toISOString(),
  })
}
