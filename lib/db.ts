"use server"

import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { compare, hash } from "bcrypt-ts"
import { v4 as uuidv4 } from "uuid"

// Configure Neon
neonConfig.fetchConnectionCache = true

// Create SQL client with Neon
export const sql = neon(process.env.DATABASE_URL || "")

// Create Drizzle client with Neon
export const db = drizzle(sql)

export async function testConnection() {
  try {
    await sql`SELECT 1`
    return { success: true }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, error }
  }
}

export async function createUser(email, password, name, phone) {
  const hashedPassword = await hash(password, 10)
  const result = await sql`
    INSERT INTO users (email, password, name, phone)
    VALUES (${email}, ${hashedPassword}, ${name}, ${phone})
    RETURNING id, email, name, role
  `
  return result[0]
}

export async function getUserByEmail(email) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`
  return result.length > 0 ? result[0] : null
}

export async function getUserByPhone(phone) {
  const result = await sql`SELECT * FROM users WHERE phone = ${phone}`
  return result.length > 0 ? result[0] : null
}

export async function getUserById(id) {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`
  return result.length > 0 ? result[0] : null
}

export async function getSessionByToken(token) {
  const result = await sql`SELECT * FROM sessions WHERE token = ${token} AND expires_at > NOW()`
  return result.length > 0 ? result[0] : null
}

export async function createSession(userId, token, expiresAt) {
  const result = await sql`
    INSERT INTO sessions (user_id, token, created_at, expires_at)
    VALUES (${userId}, ${token}, NOW(), ${expiresAt})
    RETURNING *
  `
  return result[0]
}

export async function deleteSession(token) {
  await sql`DELETE FROM sessions WHERE token = ${token}`
  return true
}

export async function createPasswordResetToken(userId, token, expiresAt) {
  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
  `
}

export async function verifyPasswordResetToken(token) {
  const result = await sql`
    SELECT user_id FROM password_reset_tokens 
    WHERE token = ${token} AND expires_at > NOW() AND is_valid = true
  `
  return result.length > 0 ? result[0].user_id : null
}

export async function invalidatePasswordResetToken(token) {
  await sql`
    UPDATE password_reset_tokens
    SET is_valid = false
    WHERE token = ${token}
  `
}

export async function createVerificationCode(identifier, code) {
  await sql`
    INSERT INTO verification_codes (identifier, code, expires_at)
    VALUES (${identifier}, ${code}, NOW() + INTERVAL '15 minutes')
  `
}

export async function getVerificationCode(identifier) {
  const result = await sql`
    SELECT * FROM verification_codes 
    WHERE identifier = ${identifier} AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `
  return result.length > 0 ? result[0] : null
}

export async function deleteVerificationCode(identifier) {
  await sql`DELETE FROM verification_codes WHERE identifier = ${identifier}`
}

export async function updateUserPassword(userId, password) {
  const hashedPassword = await hash(password, 10)
  await sql`UPDATE users SET password = ${hashedPassword}, updated_at = NOW() WHERE id = ${userId}`
}

export async function getAllUsersWithDetails() {
  return await sql`SELECT * FROM users ORDER BY created_at DESC`
}

export async function updateSessionExpiry(token, expiresAt) {
  await sql`UPDATE sessions SET expires_at = ${expiresAt} WHERE token = ${token}`
}

export async function deleteUser(userId) {
  await sql`DELETE FROM users WHERE id = ${userId}`
}

export async function updateUserRole(userId, role) {
  await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`
}

export async function deletePredictionById(id) {
  await sql`DELETE FROM predictions WHERE id = ${id}`
}

export async function clearUserPredictions(userId) {
  await sql`DELETE FROM predictions WHERE user_id = ${userId}`
}

export async function updateUserPhone(userId, phone) {
  await sql`UPDATE users SET phone = ${phone} WHERE id = ${userId}`
}

// Add missing exports required for deployment

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePasswords(plainPassword, hashedPassword) {
  return await compare(plainPassword, hashedPassword)
}

/**
 * Create a new prediction record
 */
export async function createPrediction(userId, result, predictionData) {
  const predictionId = uuidv4()

  const predictions = await sql`
    INSERT INTO predictions (id, user_id, result, prediction_data)
    VALUES (${predictionId}, ${userId}, ${result}, ${JSON.stringify(predictionData)})
    RETURNING *
  `

  return predictions[0]
}

/**
 * Get predictions by user ID
 */
export async function getPredictionsByUserId(userId) {
  const predictions = await sql`
    SELECT * FROM predictions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `

  return predictions
}

/**
 * Get a prediction by ID
 */
export async function getPredictionById(id) {
  const predictions = await sql`
    SELECT p.*, u.name, u.email
    FROM predictions p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ${id}
  `

  return predictions.length > 0 ? predictions[0] : null
}

/**
 * Verify an OTP code for a user
 */
export async function verifyOTP(userId, otp) {
  try {
    if (!userId || !otp) {
      return { success: false, message: "User ID and OTP are required" }
    }

    // First try to find by direct user ID
    let verificationRecord = await sql`
      SELECT * FROM verification_codes
      WHERE identifier = ${userId} AND code = ${otp} AND expires_at > NOW()
    `

    // If not found and userId looks like an email, try to get the user first
    if (verificationRecord.length === 0 && userId.includes("@")) {
      const user = await getUserByEmail(userId)
      if (user) {
        verificationRecord = await sql`
          SELECT * FROM verification_codes
          WHERE identifier = ${user.id} AND code = ${otp} AND expires_at > NOW()
        `
      }
    }

    if (verificationRecord.length === 0) {
      return { success: false, message: "Verification code not found or expired" }
    }

    // Delete the used code
    await sql`DELETE FROM verification_codes WHERE identifier = ${userId} AND code = ${otp}`

    return { success: true, message: "Verification successful" }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return {
      success: false,
      message: `Failed to verify OTP: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
