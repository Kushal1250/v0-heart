import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Check admin authentication
    const isAdmin = cookies().get("is_admin")?.value === "true"

    if (!isAdmin) {
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Test connection and measure response time
    const startTime = Date.now()
    const connectionTest = await sql`SELECT 1 as connected`
    const responseTime = Date.now() - startTime

    // Get database version
    const versionResult = await sql`SELECT version() as version`
    const serverVersion = versionResult[0]?.version || "Unknown"

    // Get table information
    const tableInfoQuery = await sql`
      SELECT 
        table_name,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = (quote_ident(table_name)::regclass)) as row_count,
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size,
        now()::text as last_analyzed
      FROM 
        information_schema.tables
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name
    `

    // Get connection pool information
    const poolInfoQuery = await sql`
      SELECT 
        count(*) as active_connections
      FROM 
        pg_stat_activity
      WHERE 
        datname = current_database()
    `

    const activeConnections = poolInfoQuery[0]?.active_connections || 0

    return NextResponse.json({
      success: true,
      connected: connectionTest[0]?.connected === 1,
      responseTime: `${responseTime}ms`,
      serverVersion: serverVersion.split(" ")[0],
      tables: tableInfoQuery,
      connections: {
        active: activeConnections,
        max: 10, // This would ideally come from your connection pool configuration
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database diagnostics failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 },
    )
  }
}
