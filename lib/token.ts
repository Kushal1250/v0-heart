import crypto from "crypto"
import { db } from "./db"
import { logError } from "./error-logger"

/**
 * Generate a random token
 * @param length The length of the token to generate
 * @returns A random token string
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

/**
 * Create a password reset token for a user
 * @param userId The ID of the user
 * @param expiresIn Time in milliseconds until the token expires (default: 1 hour)
 * @returns The generated token and expiration timestamp
 */
export async function createPasswordResetToken(
  userId: string,
  expiresIn = 3600000,
): Promise<{ token: string; expires: Date }> {
  const token = generateToken()
  const expires = new Date(Date.now() + expiresIn)

  try {
    console.log(`Creating password reset token for user ID: ${userId}`)

    // First, check if the password_reset_tokens table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      )
    `)

    if (!tableExists.rows[0].exists) {
      console.error("password_reset_tokens table does not exist")
      // Create the table if it doesn't exist
      await db.query(`
        CREATE TABLE password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_valid BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create indexes
      await db.query(`CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)`)
      await db.query(`CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)`)

      console.log("Created password_reset_tokens table")
    }

    // First, invalidate any existing tokens for this user
    try {
      await db.query(
        `
        UPDATE password_reset_tokens 
        SET is_valid = false 
        WHERE user_id = $1
      `,
        [userId],
      )
      console.log(`Invalidated existing tokens for user ID: ${userId}`)
    } catch (invalidateError) {
      console.error("Error invalidating existing tokens:", invalidateError)
      // Continue with token creation even if invalidation fails
      await logError("invalidateTokens", invalidateError, { userId })
    }

    // Then create a new token - using a more direct approach without foreign key constraints
    const result = await db.query(
      `
      INSERT INTO password_reset_tokens (user_id, token, expires_at, is_valid) 
      VALUES ($1, $2, $3, true)
      RETURNING token, expires_at
    `,
      [userId, token, expires],
    )

    if (!result.rows || result.rows.length === 0) {
      throw new Error("No rows returned after token creation")
    }

    console.log(`Successfully created password reset token for user ID: ${userId}`)
    return { token, expires }
  } catch (error) {
    console.error("Error creating password reset token:", error)
    await logError("createPasswordResetToken", error, { userId })
    throw new Error("Failed to create password reset token")
  }
}

/**
 * Verify a password reset token
 * @param token The token to verify
 * @returns The user ID if valid, null otherwise
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  try {
    if (!token) {
      console.error("verifyPasswordResetToken called with empty token")
      return null
    }

    console.log(`Verifying password reset token: ${token}`)

    const result = await db.query(
      `
      SELECT user_id FROM password_reset_tokens 
      WHERE token = $1 AND expires_at > NOW() AND is_valid = true 
      LIMIT 1
    `,
      [token],
    )

    if (!result.rows || result.rows.length === 0) {
      console.log(`No valid token found for: ${token}`)
      return null
    }

    console.log(`Valid token found for user: ${result.rows[0].user_id}`)
    return result.rows[0].user_id
  } catch (error) {
    console.error("Error verifying password reset token:", error)
    await logError("verifyPasswordResetToken", error, { token })
    return null
  }
}

/**
 * Invalidate a password reset token after it's been used
 * @param token The token to invalidate
 */
export async function invalidatePasswordResetToken(token: string): Promise<void> {
  try {
    if (!token) {
      console.error("invalidatePasswordResetToken called with empty token")
      return
    }

    console.log(`Invalidating password reset token: ${token}`)

    await db.query(
      `
      UPDATE password_reset_tokens 
      SET is_valid = false 
      WHERE token = $1
    `,
      [token],
    )

    console.log(`Token invalidated successfully: ${token}`)
  } catch (error) {
    console.error("Error invalidating password reset token:", error)
    await logError("invalidatePasswordResetToken", error, { token })
  }
}
