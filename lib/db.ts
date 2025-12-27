import { neon } from "@neondatabase/serverless"
import { hash, compare } from "bcrypt-ts"
import { v4 as uuidv4 } from "uuid"

// Create a SQL query executor using the Neon serverless driver
export const sql = neon(process.env.DATABASE_URL!)
// Export db as an alias for sql for backward compatibility
export const db = sql

// Initialize database tables
export async function initDatabase() {
  try {
    // Create users table if it doesn't exist
    await sql`
     CREATE TABLE IF NOT EXISTS users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       email TEXT UNIQUE NOT NULL,
       password TEXT NOT NULL,
       name TEXT,
       phone TEXT,
       role TEXT NOT NULL DEFAULT 'user',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       last_login TIMESTAMP WITH TIME ZONE,
       provider TEXT
     )
   `

    // Create sessions table if it doesn't exist
    await sql`
     CREATE TABLE IF NOT EXISTS sessions (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       token TEXT UNIQUE NOT NULL,
       expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     )
   `

    // Create password_resets table if it doesn't exist
    await sql`
     CREATE TABLE IF NOT EXISTS password_reset_tokens (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id TEXT NOT NULL,
       token TEXT NOT NULL,
       expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
       is_valid BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
     );
     
     CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
     CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
   `

    // Create predictions table if it doesn't exist
    await sql`
     CREATE TABLE IF NOT EXISTS predictions (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       result NUMERIC NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       prediction_data JSONB
     )
   `

    // Create verification codes table if it doesn't exist
    await sql`
     CREATE TABLE IF NOT EXISTS verification_codes (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id TEXT NOT NULL,
       code TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
     )
   `

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Failed to initialize database:", error)
    return false
  }
}

// User functions
export async function getUserByEmail(email: string) {
  try {
    if (!email) {
      throw new Error("Email is required to get user")
    }

    const normalizedEmail = email.toLowerCase().trim()
    const users = await sql`SELECT * FROM users WHERE LOWER(email) = ${normalizedEmail}`
    return users[0] || null
  } catch (error) {
    console.error("Database error in getUserByEmail:", error)
    throw new Error(`Failed to get user by email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getUserByPhone(phone: string) {
  const result = await sql`
   SELECT * FROM users
   WHERE phone = ${phone}
 `

  return result.length > 0 ? result[0] : null
}

export async function getUserByEmailAndPhone(email: string, phone: string) {
  try {
    if (!email || !phone) {
      throw new Error("Email and phone are required to get user")
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email} AND phone = ${phone}`
    return users[0] || null
  } catch (error) {
    console.error("Database error in getUserByEmailAndPhone:", error)
    throw new Error(
      `Failed to get user by email and phone: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

export async function getUserById(id: string) {
  try {
    if (!id) {
      console.error("getUserById called with empty ID")
      throw new Error("User ID is required")
    }

    console.log(`getUserById - Fetching user with ID: ${id}`)
    const users = await sql`SELECT * FROM users WHERE id = ${id}`

    if (users.length === 0) {
      console.log(`getUserById - No user found with ID: ${id}`)
      return null
    }

    console.log(`getUserById - Successfully retrieved user with ID: ${id}`)
    return users[0] || null
  } catch (error) {
    console.error(`Database error in getUserById for ID ${id}:`, error)
    throw new Error(`Failed to get user by ID: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function createUser(email: string, password: string, name: string, phone = "") {
  try {
    const result = await sql`
     INSERT INTO users (email, password, name, phone)
     VALUES (${email}, ${password}, ${name}, ${phone})
     RETURNING id, email, name, role, phone
   `

    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

export async function comparePasswords(password: string, hashedPassword: string) {
  try {
    console.log("Comparing passwords...")
    const result = await compare(password, hashedPassword)
    console.log("Password comparison result:", result)
    return result
  } catch (error) {
    console.error("Password comparison error:", error)
    throw new Error("Password comparison failed")
  }
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return comparePasswords(password, hashedPassword)
}

// Session functions
export async function createSession(userId: string, token: string, expiresAt: Date) {
  try {
    if (!userId || !token || !expiresAt) {
      throw new Error("User ID, token, and expiration date are required to create a session")
    }

    const sessionId = uuidv4()

    await sql`
     INSERT INTO sessions (id, user_id, token, expires_at)
     VALUES (${sessionId}, ${userId}, ${token}, ${expiresAt})
   `
    return true
  } catch (error) {
    console.error("Database error in createSession:", error)
    throw new Error(`Failed to create session: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getSessionByToken(token: string) {
  try {
    if (!token) {
      throw new Error("Token is required to get session")
    }

    const sessions = await sql`
     SELECT * FROM sessions 
     WHERE token = ${token} AND expires_at > NOW()
   `
    return sessions[0] || null
  } catch (error) {
    console.error("Database error in getSessionByToken:", error)
    throw new Error(`Failed to get session: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deleteSession(token: string) {
  try {
    if (!token) {
      throw new Error("Token is required to delete session")
    }

    await sql`DELETE FROM sessions WHERE token = ${token}`
    return true
  } catch (error) {
    console.error("Database error in deleteSession:", error)
    throw new Error(`Failed to delete session: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function updateSessionExpiry(token: string, expiresAt: Date) {
  try {
    if (!token || !expiresAt) {
      throw new Error("Token and expiration date are required to update session expiry")
    }

    await sql`
     UPDATE sessions
     SET expires_at = ${expiresAt}
     WHERE token = ${token}
   `
    return true
  } catch (error) {
    console.error("Database error in updateSessionExpiry:", error)
    throw new Error(`Failed to update session expiry: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Password reset functions
export async function createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
  try {
    if (!userId || !token || !expiresAt) {
      throw new Error("User ID, token, and expiration date are required to create a password reset token")
    }

    await sql`
     INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES (${userId}, ${token}, ${expiresAt})
   `
    return true
  } catch (error) {
    console.error("Database error in createPasswordResetToken:", error)
    throw new Error(
      `Failed to create password reset token: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

export async function getPasswordResetByToken(token: string) {
  try {
    if (!token) {
      throw new Error("Token is required to get password reset")
    }

    const resets = await sql`
     SELECT * FROM password_reset_tokens
     WHERE token = ${token} AND expires_at > NOW() AND is_valid = true
   `
    return resets[0] || null
  } catch (error) {
    console.error("Database error in getPasswordResetByToken:", error)
    throw new Error(`Failed to get password reset: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deletePasswordReset(token: string) {
  try {
    if (!token) {
      throw new Error("Token is required to delete password reset")
    }

    await sql`DELETE FROM password_reset_tokens WHERE token = ${token}`
    return true
  } catch (error) {
    console.error("Database error in deletePasswordReset:", error)
    throw new Error(`Failed to delete password reset: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    if (!userId || !newPassword) {
      throw new Error("User ID and new password are required to update password")
    }

    const hashedPassword = await hash(newPassword, 10)

    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`
    return true
  } catch (error) {
    console.error("Database error in updateUserPassword:", error)
    throw new Error(`Failed to update password: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function verifyPasswordResetToken(token: string) {
  try {
    if (!token) {
      console.error("verifyPasswordResetToken called with empty token")
      throw new Error("Token is required")
    }

    console.log(`Verifying password reset token: ${token}`)

    const result = await sql`
     SELECT * FROM password_reset_tokens
     WHERE token = ${token}
     AND expires_at > NOW()
     AND is_valid = true
   `

    if (result.length === 0) {
      console.log(`No valid token found for: ${token}`)
      return null
    }

    console.log(`Valid token found: ${token}`)
    return result[0]
  } catch (error) {
    console.error("Error verifying password reset token:", error)
    throw new Error(`Failed to verify token: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function invalidatePasswordResetToken(token: string) {
  try {
    if (!token) {
      console.error("invalidatePasswordResetToken called with empty token")
      throw new Error("Token is required")
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
    throw new Error(`Failed to invalidate token: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Admin functions
export async function getAllUsers() {
  try {
    const users = await sql`
     SELECT id, email, name, phone, role, created_at 
     FROM users 
     ORDER BY created_at DESC
   `
    return users
  } catch (error) {
    console.error("Database error in getAllUsers:", error)
    throw new Error(`Failed to get users: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getAllUsersWithDetails() {
  try {
    const users = await sql`
     SELECT id, email, name, phone, role, created_at, provider
     FROM users
     ORDER BY created_at DESC
   `
    return users
  } catch (error) {
    console.error("Database error in getAllUsersWithDetails:", error)
    throw new Error(`Failed to get users with details: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  try {
    if (!userId || !role) {
      throw new Error("User ID and role are required to update user role")
    }

    await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`
    return true
  } catch (error) {
    console.error("Database error in updateUserRole:", error)
    throw new Error(`Failed to update user role: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deleteUser(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required")
    }

    console.log("[v0] Attempting to delete user:", userId)

    // First delete all related records in dependency order
    // Delete predictions
    await sql`DELETE FROM predictions WHERE user_id = ${userId}`
    console.log("[v0] Deleted predictions for user:", userId)

    // Delete sessions
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`
    console.log("[v0] Deleted sessions for user:", userId)

    // Delete password reset tokens
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`
    console.log("[v0] Deleted password reset tokens for user:", userId)

    // Delete password resets
    await sql`DELETE FROM password_resets WHERE user_id = ${userId}`
    console.log("[v0] Deleted password resets for user:", userId)

    // Delete verification codes
    await sql`DELETE FROM verification_codes WHERE user_id = ${userId}`
    console.log("[v0] Deleted verification codes for user:", userId)

    // Delete error logs
    await sql`DELETE FROM error_logs WHERE user_id = ${userId}`
    console.log("[v0] Deleted error logs for user:", userId)

    // Finally delete the user
    const result = await sql`DELETE FROM users WHERE id = ${userId}`
    console.log("[v0] Successfully deleted user:", userId, "Result:", result)

    return true
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function verifyOTP(userId: string, otp: string) {
  try {
    if (!userId || !otp) {
      return { success: false, message: "User ID and OTP are required" }
    }

    // First try to find by direct user ID
    let verificationRecord = await getVerificationCodeByUserIdAndCode(userId, otp)

    // If not found and userId looks like an email, try to get the user first
    if (!verificationRecord && userId.includes("@")) {
      const user = await getUserByEmail(userId)
      if (user) {
        verificationRecord = await getVerificationCodeByUserIdAndCode(user.id, otp)
      }
    }

    if (!verificationRecord) {
      return { success: false, message: "Verification code not found or expired" }
    }

    // Delete the used code
    await deleteVerificationCode(verificationRecord.id)

    return { success: true, message: "Verification successful" }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return {
      success: false,
      message: `Failed to verify OTP: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function createPrediction(userId: string, result: any, predictionData: Record<string, any>): Promise<any> {
  try {
    if (!userId) {
      throw new Error("User ID is required to create a prediction")
    }

    const predictionId = uuidv4()

    const predictions = await sql`
     INSERT INTO predictions (id, user_id, result, prediction_data)
     VALUES (${predictionId}, ${userId}, ${result.score / 100}, ${JSON.stringify(predictionData)})
     RETURNING *
   `

    if (!predictions || predictions.length === 0) {
      throw new Error("Prediction creation failed - no prediction returned from database")
    }

    return predictions[0]
  } catch (error) {
    console.error("Database error in createPrediction:", error)
    throw new Error(`Failed to create prediction: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getAllPredictions() {
  try {
    const predictions = await sql`
     SELECT p.*, u.name, u.email
     FROM predictions p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC
   `
    return predictions
  } catch (error) {
    console.error("Database error in getAllPredictions:", error)
    throw new Error(`Failed to get predictions: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getPredictionsByUserId(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required to get predictions")
    }

    console.log(`Getting predictions for user ID: ${userId}`)

    const predictions = await sql`
     SELECT * FROM predictions
     WHERE user_id = ${userId}
     ORDER BY created_at DESC
   `

    console.log(`Found ${predictions.length} predictions in database for user ID: ${userId}`)

    return predictions
  } catch (error) {
    console.error("Database error in getPredictionsByUserId:", error)
    throw new Error(`Failed to get predictions: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getPredictionById(id: string) {
  try {
    if (!id) {
      throw new Error("Prediction ID is required")
    }

    const predictions = await sql`
     SELECT p.*, u.name, u.email
     FROM predictions p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = ${id}
   `
    return predictions[0] || null
  } catch (error) {
    console.error("Database error in getPredictionById:", error)
    throw new Error(`Failed to get prediction: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deletePredictionById(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Prediction ID is required to delete prediction")
    }

    await sql`DELETE FROM predictions WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Database error in deletePredictionById:", error)
    throw new Error(`Failed to delete prediction: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function clearUserPredictions(userId: string): Promise<boolean> {
  try {
    if (!userId) {
      throw new Error("User ID is required to clear predictions")
    }

    await sql`DELETE FROM predictions WHERE user_id = ${userId}`
    return true
  } catch (error) {
    console.error("Database error in clearUserPredictions:", error)
    throw new Error(`Failed to clear predictions: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function createVerificationCode(identifier: string, code: string) {
  try {
    if (!identifier || !code) {
      throw new Error("Identifier and code are required to create a verification code")
    }

    console.log(`Creating verification code for identifier: ${identifier}`)

    // Delete any existing codes for this identifier
    try {
      await sql`DELETE FROM verification_codes WHERE user_id = ${identifier}`
      console.log(`Deleted existing verification codes for ${identifier}`)
    } catch (deleteError) {
      console.error("Error deleting existing verification codes:", deleteError)
      // Continue with insertion even if deletion fails
    }

    // Create a new code
    const verificationId = uuidv4()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const result = await sql`
     INSERT INTO verification_codes (id, user_id, code, expires_at)
     VALUES (${verificationId}, ${identifier}, ${code}, ${expiresAt})
     RETURNING id, user_id, code, created_at, expires_at
   `

    console.log(`Verification code created successfully for ${identifier}`)
    return result[0]
  } catch (error) {
    console.error("Database error in createVerificationCode:", error)
    throw new Error(`Failed to create verification code: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getVerificationCodeByUserIdAndCode(userId: string, code: string) {
  try {
    if (!userId || !code) {
      throw new Error("User ID and code are required to get verification code")
    }

    const codes = await sql`
     SELECT * FROM verification_codes
     WHERE user_id = ${userId} AND code = ${code} AND expires_at > NOW()
   `
    return codes[0] || null
  } catch (error) {
    console.error("Database error in getVerificationCodeByUserIdAndCode:", error)
    throw new Error(`Failed to get verification code: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getVerificationCode(identifier: string) {
  try {
    if (!identifier) {
      throw new Error("Identifier is required to get verification code")
    }

    console.log(`Getting verification code for identifier: ${identifier}`)

    const codes = await sql`
     SELECT * FROM verification_codes
     WHERE user_id = ${identifier} AND expires_at > NOW()
   `

    if (codes.length === 0) {
      console.log(`No valid verification code found for ${identifier}`)
      return null
    }

    console.log(`Found verification code for ${identifier}`)
    return codes[0]
  } catch (error) {
    console.error("Database error in getVerificationCode:", error)
    throw new Error(`Failed to get verification code: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function verifyCode(userId: string, code: string) {
  try {
    if (!userId || !code) {
      throw new Error("User ID and code are required to verify code")
    }

    const result = await sql`
     SELECT * FROM verification_codes
     WHERE user_id = ${userId}
     AND code = ${code}
     AND expires_at > NOW()
   `

    return result.length > 0
  } catch (error) {
    console.error("Database error in verifyCode:", error)
    throw new Error(`Failed to verify code: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deleteVerificationCode(identifier: string) {
  try {
    if (!identifier) {
      throw new Error("Identifier is required to delete verification code")
    }

    await sql`DELETE FROM verification_codes WHERE user_id = ${identifier}`
    console.log(`Deleted verification code for identifier: ${identifier}`)
    return true
  } catch (error) {
    console.error("Database error in deleteVerificationCode:", error)
    throw new Error(`Failed to delete verification code: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function updateUserPhone(userId: string, phone: string) {
  try {
    if (!userId || !phone) {
      throw new Error("User ID and phone number are required to update phone number")
    }

    await sql`UPDATE users SET phone = ${phone} WHERE id = ${userId}`
    return true
  } catch (error) {
    console.error("Database error in updateUserPhone:", error)
    throw new Error(`Failed to update phone number: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
