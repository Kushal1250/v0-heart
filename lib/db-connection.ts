import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql } from "@vercel/postgres"

// Create a connection pool
let cachedConnection: any = null

export async function getDbConnection() {
  if (cachedConnection) {
    return cachedConnection
  }

  try {
    // Try to use Neon database first
    if (process.env.POSTGRES_URL) {
      const neonConnection = neon(process.env.POSTGRES_URL)
      cachedConnection = drizzle(neonConnection)
      console.log("Connected to Neon database successfully")
      return cachedConnection
    }

    // Fallback to Vercel Postgres
    cachedConnection = { sql }
    console.log("Connected to Vercel Postgres successfully")
    return cachedConnection
  } catch (error) {
    console.error("Database connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

export async function testDbConnection() {
  try {
    const db = await getDbConnection()

    // Test the connection with a simple query
    let result
    if (db.sql) {
      result = await db.sql`SELECT NOW() as time`
    } else {
      result = await db.execute(sql`SELECT NOW() as time`)
    }

    return {
      success: true,
      message: "Database connection successful",
      timestamp: result[0]?.time || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      message: "Database connection failed",
      error: String(error),
    }
  }
}
