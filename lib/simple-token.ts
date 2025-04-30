import crypto from "crypto"
import { db } from "./db"

/**
 * Generate a random token
 */
export function generateSimpleToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

/**
 * Create a password reset token using a very simple approach
 * This function avoids foreign keys and complex queries
 */
export async function createSimpleResetToken(userId: string): Promise<{ token: string; expires: Date }> {
  try {
    // Generate token and expiration
    const token = generateSimpleToken()
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    console.log(`Creating simple reset token for user ID: ${userId}`)

    // Use a direct SQL approach with minimal complexity
    // First check if the table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'simple_reset_tokens'
      )
    `)

    // Create the table if it doesn't exist
    if (!tableExists.rows[0].exists) {
      console.log("Creating simple_reset_tokens table")
      await db.query(`
        CREATE TABLE simple_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    // Insert the token
    await db.query(
      `
      INSERT INTO simple_reset_tokens (user_id, token, expires_at) 
      VALUES ($1, $2, $3)
    `,
      [userId, token, expires],
    )

    console.log(`Successfully created simple reset token for user ID: ${userId}`)
    return { token, expires }
  } catch (error) {
    console.error("Error creating simple reset token:", error)
    throw new Error("Failed to create reset token")
  }
}

/**
 * Verify a simple reset token
 */
export async function verifySimpleResetToken(token: string): Promise<string | null> {
  try {
    const result = await db.query(
      `
      SELECT user_id FROM simple_reset_tokens 
      WHERE token = $1 AND expires_at > NOW() 
      LIMIT 1
    `,
      [token],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0].user_id
  } catch (error) {
    console.error("Error verifying simple reset token:", error)
    return null
  }
}
