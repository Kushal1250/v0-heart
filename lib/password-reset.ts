import { v4 as uuidv4 } from "uuid"
import { createPasswordResetToken, verifyPasswordResetToken, invalidatePasswordResetToken } from "@/lib/db"

/**
 * Create a reset token for a user
 * @param userId The user ID
 * @param expiresIn Time in milliseconds until the token expires (default: 1 hour)
 * @returns The token and expiration date
 */
export async function createResetToken(userId: string, expiresIn = 3600000) {
  try {
    const token = uuidv4()
    const expires = new Date(Date.now() + expiresIn)

    // Use the database function to create the token
    await createPasswordResetToken(userId, token, expires)

    return { token, expires }
  } catch (error) {
    console.error("Error in createResetToken:", error)
    throw new Error("Failed to create password reset token")
  }
}

/**
 * Verify a reset token
 * @param token The token to verify
 * @returns The user ID if valid, null otherwise
 */
export async function verifyResetToken(token: string) {
  return await verifyPasswordResetToken(token)
}

/**
 * Invalidate a reset token
 * @param token The token to invalidate
 */
export async function invalidateResetToken(token: string) {
  return await invalidatePasswordResetToken(token)
}
