import { v4 as uuidv4 } from "uuid"
import { sql } from "./db"

/**
 * Create a simple password reset token
 * @param userId User ID
 * @returns Token and expiration date
 */
export async function createSimpleResetToken(userId: string): Promise<{ token: string; expires: Date }> {
  try {
    console.log(`Creating simple reset token for user ID: ${userId}`)

    // Generate a random token
    const token = uuidv4()

    // Set expiration to 1 hour from now
    const expires = new Date(Date.now() + 3600000)

    // First check if the table exists
    try {
      // Try to create the table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_valid BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create indexes if they don't exist
      await sql`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)
      `

      await sql`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)
      `

      console.log("Password reset tokens table verified/created")
    } catch (tableError) {
      console.error("Error checking/creating table:", tableError)
      // Continue anyway, as the table might already exist
    }

    // Invalidate any existing tokens for this user
    try {
      await sql`
        UPDATE password_reset_tokens 
        SET is_valid = false 
        WHERE user_id = ${userId}
      `
      console.log(`Invalidated existing tokens for user ID: ${userId}`)
    } catch (invalidateError) {
      console.error("Error invalidating existing tokens:", invalidateError)
      // Continue with token creation even if invalidation fails
    }

    // Insert the new token with direct SQL approach
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at, is_valid) 
      VALUES (${userId}, ${token}, ${expires}, true)
    `

    console.log(`Successfully created password reset token for user ID: ${userId}`)
    return { token, expires }
  } catch (error) {
    console.error("Error in createSimpleResetToken:", error)

    // Try an alternative approach if the first one fails
    try {
      console.log("Attempting alternative token creation approach...")

      const token = uuidv4()
      const expires = new Date(Date.now() + 3600000)

      // Use a more direct query with explicit values
      await sql.query(
        `
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at, is_valid) 
        VALUES ($1, $2, $3, $4, $5)
      `,
        [uuidv4(), userId, token, expires, true],
      )

      console.log("Alternative token creation successful")
      return { token, expires }
    } catch (fallbackError) {
      console.error("Fallback token creation also failed:", fallbackError)
      throw new Error("Failed to create password reset token after multiple attempts")
    }
  }
}

/**
 * Verify a password reset token
 * @param token Token to verify
 * @returns User ID if valid, null otherwise
 */
export async function verifySimpleResetToken(token: string): Promise<string | null> {
  try {
    if (!token) {
      console.error("verifySimpleResetToken called with empty token")
      return null
    }

    console.log(`Verifying password reset token: ${token}`)

    const result = await sql`
      SELECT user_id FROM password_reset_tokens 
      WHERE token = ${token} 
      AND expires_at > NOW() 
      AND is_valid = true
    `

    if (result.length === 0) {
      console.log(`No valid token found for: ${token}`)
      return null
    }

    console.log(`Valid token found: ${token}`)
    return result[0].user_id
  } catch (error) {
    console.error("Error verifying password reset token:", error)
    return null
  }
}

/**
 * Invalidate a password reset token
 * @param token Token to invalidate
 * @returns Success status
 */
export async function invalidateSimpleResetToken(token: string): Promise<boolean> {
  try {
    if (!token) {
      console.error("invalidateSimpleResetToken called with empty token")
      return false
    }

    console.log(`Invalidating password reset token: ${token}`)

    await sql`
      UPDATE password_reset_tokens
      SET is_valid = false
      WHERE token = ${token}
    `

    console.log(`Token invalidated successfully: ${token}`)
    return true
  } catch (error) {
    console.error("Error invalidating password reset token:", error)
    return false
  }
}
