import crypto from "crypto"
import { db } from "./db"

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
    // First, invalidate any existing tokens for this user
    await db.query("UPDATE password_reset_tokens SET is_valid = false WHERE user_id = $1", [userId])

    // Then create a new token
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, is_valid) 
       VALUES ($1, $2, $3, true)`,
      [userId, token, expires],
    )

    return { token, expires }
  } catch (error) {
    console.error("Error creating password reset token:", error)
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
    const result = await db.query(
      `SELECT user_id FROM password_reset_tokens 
       WHERE token = $1 AND expires_at > NOW() AND is_valid = true 
       LIMIT 1`,
      [token],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0].user_id
  } catch (error) {
    console.error("Error verifying password reset token:", error)
    return null
  }
}

/**
 * Invalidate a password reset token after it's been used
 * @param token The token to invalidate
 */
export async function invalidatePasswordResetToken(token: string): Promise<void> {
  try {
    await db.query("UPDATE password_reset_tokens SET is_valid = false WHERE token = $1", [token])
  } catch (error) {
    console.error("Error invalidating password reset token:", error)
  }
}
