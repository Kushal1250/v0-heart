import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  const dbStatus = {
    connected: false,
    error: "",
  }

  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      dbStatus.error = "DATABASE_URL environment variable is not set"
      return NextResponse.json(
        {
          status: "error",
          database: dbStatus,
        },
        { status: 500 },
      )
    }

    // Test database connection
    const result = await sql`SELECT 1 as connection_test`

    if (result && result.length > 0 && result[0].connection_test === 1) {
      dbStatus.connected = true
    } else {
      dbStatus.error = "Database connection test failed"
    }
  } catch (error) {
    console.error("Database health check failed:", error)
    dbStatus.error = error instanceof Error ? error.message : "Unknown database error"
  }

  return NextResponse.json(
    {
      status: dbStatus.connected ? "ok" : "error",
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
    { status: dbStatus.connected ? 200 : 500 },
  )
}
