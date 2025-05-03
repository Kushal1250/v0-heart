import jwt from "jsonwebtoken"
import { JWT_SECRET_KEY } from "./constants"

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token The JWT token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyJwtToken(token: string): any {
  try {
    // Use the JWT_SECRET_KEY from environment variables or use a default for development
    const secret = process.env.JWT_SECRET_KEY || JWT_SECRET_KEY || "default_jwt_secret_key"

    // Verify the token and return the decoded payload
    const decoded = jwt.verify(token, secret)
    return decoded
  } catch (error) {
    console.error("Error verifying JWT token:", error)
    return null
  }
}

/**
 * Generates a JWT token for a user
 * @param payload The data to encode in the token
 * @param expiresIn Token expiration time (default: '1d')
 * @returns The generated JWT token
 */
export function generateJwtToken(payload: any, expiresIn = "1d"): string {
  const secret = process.env.JWT_SECRET_KEY || JWT_SECRET_KEY || "default_jwt_secret_key"
  return jwt.sign(payload, secret, { expiresIn })
}
