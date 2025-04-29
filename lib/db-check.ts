import { neon } from "@neondatabase/serverless"

/**
 * Checks if the database connection is working
 * @returns Object with status and error message if any
 */
export async function checkDatabaseConnection() {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return {
        connected: false,
        error: "DATABASE_URL environment variable is not set",
      }
    }

    // Try to establish a connection
    const sql = neon(process.env.DATABASE_URL)
    const result = await sql`SELECT 1 as connection_test`

    if (result && result.length > 0 && result[0].connection_test === 1) {
      return {
        connected: true,
        error: null,
      }
    } else {
      return {
        connected: false,
        error: "Database connection test failed",
      }
    }
  } catch (error) {
    console.error("Database connection check failed:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}
