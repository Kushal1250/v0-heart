import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Simple query to check if database is connected
    const startTime = Date.now()
    const result = await sql`SELECT 1 as connected`
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      connected: result[0]?.connected === 1,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database connection check failed:", error)
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}
