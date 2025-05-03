import crypto from "crypto"
import { db } from "./db"
import jwt from "jsonwebtoken"

/**
 * Generate a random token
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

/**
 * Create a password reset token for a user - simplified version
 */
export async function createPasswordResetToken(userId: string): Promise<{ token: string; expires: Date }> {
  try {
    // Generate token and expiration
    const token = generateToken()
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    console.log(`Creating password reset token for user ID: ${userId}`)

    // Direct SQL approach without any fancy features
    const query = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at, is_valid) 
      VALUES ($1, $2, $3, true)
    `

    await db.query(query, [userId, token, expires])

    console.log(`Successfully created password reset token for user ID: ${userId}`)
    return { token, expires }
  } catch (error) {
    console.error("Error creating password reset token:", error)

    // Check if the error is related to the table not existing
    if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
      console.log("Table does not exist, attempting to create it")

      try {
        // Create the table
        await db.query(`
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            is_valid BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
          CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
        `)

        // Try again
        const token = generateToken()
        const expires = new Date(Date.now() + 3600000)

        await db.query(
          `
          INSERT INTO password_reset_tokens (user_id, token, expires_at, is_valid) 
          VALUES ($1, $2, $3, true)
        `,
          [userId, token, expires],
        )

        return { token, expires }
      } catch (retryError) {
        console.error("Error creating table and retrying:", retryError)
        throw new Error("Failed to create password reset token")
      }
    }

    throw new Error("Failed to create password reset token")
  }
}

/**
 * Verify a password reset token - simplified version
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  try {
    const query = `
      SELECT user_id FROM password_reset_tokens 
      WHERE token = $1 AND expires_at > NOW() AND is_valid = true 
      LIMIT 1
    `

    const result = await db.query(query, [token])

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
 * Verify a JWT token
 * @param token The JWT token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyJwtToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET_KEY || "default_jwt_secret_key"
    const decoded = jwt.verify(token, secret)
    return decoded
  } catch (error) {
    console.error("Error verifying JWT token:", error)
    return null
  }
}

/**
 * Generate a JWT token
 * @param payload The data to encode in the token
 * @param expiresIn Expiration time (e.g., '1h', '7d')
 * @returns The generated JWT token
 */
export function generateJwtToken(payload: any, expiresIn = "24h"): string {
  const secret = process.env.JWT_SECRET_KEY || "default_jwt_secret_key"
  return jwt.sign(payload, secret, { expiresIn })
}

export * from "./token-utils"
