import { db } from "@/lib/db"

/**
 * This script checks the database connection and retrieves migration information
 */
export async function checkDatabaseStatus() {
  try {
    console.log("Checking database status...")

    // Test database connection
    const result = await db`SELECT 1 as connected`
    const isConnected = result && result.length > 0 && result[0].connected === 1

    if (!isConnected) {
      return {
        success: false,
        message: "Database connection failed",
        status: "disconnected",
      }
    }

    // Get last migration info
    // This is a simplified example - in a real app, you might have a migrations table
    const tables = await db`
      SELECT table_name, create_time
      FROM information_schema.tables
      WHERE table_schema = current_schema()
      ORDER BY create_time DESC
      LIMIT 1
    `

    const lastMigration =
      tables.length > 0
        ? {
            table: tables[0].table_name,
            date: tables[0].create_time,
          }
        : { table: "Unknown", date: null }

    return {
      success: true,
      message: "Database is connected",
      status: "connected",
      lastMigration,
    }
  } catch (error) {
    console.error("Error checking database status:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      status: "error",
    }
  }
}
