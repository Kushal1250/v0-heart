import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

/**
 * Creates a password reset token without foreign key constraints
 * This is a more resilient version that doesn't rely on foreign keys
 */
export async function createResetToken(userId: string, token: string, expiresAt: Date) {
  try {
    if (!userId || !token || !expiresAt) {
      throw new Error("User ID, token, and expiration date are required")
    }

    console.log(`Creating resilient password reset token for user ID: ${userId}`)

    // First, invalidate any existing tokens for this user
    try {
      await sql`
        UPDATE password_reset_tokens 
        SET is_valid = false 
        WHERE user_id::text = ${userId}::text
      `
      console.log(`Invalidated existing tokens for user ID: ${userId}`)
    } catch (invalidateError) {
      console.error("Error invalidating existing tokens (non-critical):", invalidateError)
      // Continue with token creation even if invalidation fails
    }

    const resetId = uuidv4()

    // Insert the new token with proper error handling
    // Use parameterized query for better type handling
    const result = await sql`
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES (${resetId}, ${userId}::uuid, ${token}, ${expiresAt})
      RETURNING id, token, expires_at
    `

    console.log(`Successfully created password reset token for user ID: ${userId}`)
    return result[0] || true
  } catch (error) {
    console.error("Error creating resilient password reset token:", error)
    throw new Error(`Failed to create reset token: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Gets a password reset token by token string
 */
export async function getResetToken(token: string) {
  try {
    if (!token) {
      throw new Error("Token is required")
    }

    const resets = await sql`
      SELECT * FROM password_reset_tokens
      WHERE token = ${token} AND expires_at > NOW() AND is_valid = true
    `
    return resets[0] || null
  } catch (error) {
    console.error("Error getting password reset token:", error)
    return null
  }
}

/**
 * Invalidates a password reset token
 */
export async function invalidateResetToken(token: string) {
  try {
    if (!token) {
      throw new Error("Token is required")
    }

    await sql`
      UPDATE password_reset_tokens
      SET is_valid = false
      WHERE token = ${token}
    `
    return true
  } catch (error) {
    console.error("Error invalidating password reset token:", error)
    return false
  }
}
