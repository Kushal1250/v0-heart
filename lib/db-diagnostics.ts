import { db } from "./db"
import { logError } from "./error-logger"

/**
 * Tests the database connection and returns diagnostic information
 */
export async function testDatabaseConnection() {
  try {
    // Test basic connection
    const result = await db.query("SELECT NOW() as time")
    console.log("Database connection successful:", result.rows[0])

    return {
      success: true,
      message: "Database connection successful",
      timestamp: result.rows[0].time,
    }
  } catch (error) {
    console.error("Database connection failed:", error)
    await logError("testDatabaseConnection", error)
    return {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Checks if the password_reset_tokens table exists and has the correct structure
 */
export async function checkResetTokensTable() {
  try {
    // Check if table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      )
    `)

    if (!tableExists.rows[0].exists) {
      return {
        success: false,
        message: "password_reset_tokens table does not exist",
        exists: false,
      }
    }

    // Check table structure
    const columns = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'password_reset_tokens'
    `)

    return {
      success: true,
      message: "password_reset_tokens table exists",
      exists: true,
      columns: columns.rows,
    }
  } catch (error) {
    console.error("Error checking reset tokens table:", error)
    await logError("checkResetTokensTable", error)
    return {
      success: false,
      message: "Error checking reset tokens table",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
