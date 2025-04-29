import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth-utils"

export async function GET(request: Request) {
  // Only allow admins to access this route
  const admin = await verifyAdminSession(request)
  if (!admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Extract environment variables but hide sensitive details
  const config = {
    server: process.env.EMAIL_SERVER || "Not configured",
    port: process.env.EMAIL_PORT || "Not configured",
    secure: process.env.EMAIL_SECURE === "true" ? "Yes" : "No",
    user: process.env.EMAIL_USER ? "Configured" : "Not configured",
    from: process.env.EMAIL_FROM || "Not configured",
  }

  return NextResponse.json(config)
}
