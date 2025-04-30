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
        provider TEXT,
        profile_picture TEXT
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

    const users = await sql`SELECT * FROM users WHERE email = ${email}`
    return users[0] || null
  } catch (error) {
    console.error("Database error in getUserByEmail:", error)
    throw new Error(`Failed to get user by email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Add this function after the getUserByEmail function

/**
 * Get user by phone number
 * @param phone Phone number
 * @returns User object or null
 */
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

export async function createUser(email: string, password: string, name?: string, phone?: string, provider?: string) {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required to create a user")
    }

    const hashedPassword = await hash(password, 10)
    const userId = uuidv4()

    const users = await sql`
      INSERT INTO users (id, email, password, name, phone, role, provider)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${name || null}, ${phone || null}, 'user', ${provider || null})
      RETURNING *
    `

    if (!users || users.length === 0) {
      throw new Error("User creation failed - no user returned from database")
    }

    return users[0]
  } catch (error) {
    console.error("Database error in createUser:", error)

    // Check for unique constraint violation (email already exists)
    if (error instanceof Error && error.message.includes("unique constraint")) {
      throw new Error("Email address is already in use")
    }

    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Add back the comparePasswords function that was missing
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

// Keep the verifyPassword function as an alias for comparePasswords for new code
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

// Password reset functions
// Replace the createPasswordResetToken function with this improved version
export async function createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
  try {
    if (!userId || !token || !expiresAt) {
      throw new Error("User ID, token, and expiration date are required to create a password reset token")
    }

    console.log(`Creating password reset token for user ID: ${userId}`)

    // First, invalidate any existing tokens for this user
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

    const resetId = uuidv4()

    // Insert the new token with proper error handling
    const result = await sql`
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
      VALUES (${resetId}, ${userId}, ${token}, ${expiresAt})
      RETURNING id, token, expires_at
    `

    console.log(`Successfully created password reset token for user ID: ${userId}`)
    return result[0] || true
  } catch (error) {
    console.error("Database error in createPasswordResetToken:", error)

    // Check for specific database errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    if (errorMessage.includes("foreign key constraint")) {
      throw new Error("Invalid user ID provided for password reset token")
    }

    if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
      throw new Error("Password reset tokens table does not exist")
    }

    throw new Error(`Failed to create password reset token: ${errorMessage}`)
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

    await sql`DELETE FROM password_resets WHERE token = ${token}`
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

    console.log("Hashing new password...")
    const hashedPassword = await hash(newPassword, 10)

    console.log("Updating password for user:", userId)
    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`

    console.log("Password updated successfully")
    return true
  } catch (error) {
    console.error("Database error in updateUserPassword:", error)
    throw new Error(`Failed to update password: ${error instanceof Error ? error.message : "Unknown error"}`)
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
    // Modified query to exclude the last_login column that doesn't exist
    const users = await sql`
      SELECT id, email, name, phone, role, created_at, provider, profile_picture
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
      throw new Error("User ID is required to delete user")
    }

    await sql`DELETE FROM users WHERE id = ${userId}`
    return true
  } catch (error) {
    console.error("Database error in deleteUser:", error)
    throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Add profile_picture to the updateUserProfile function
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string
    phone?: string
    profile_picture?: string
  },
) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Build the SET clause dynamically based on provided fields
    const setFields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.name !== undefined) {
      setFields.push(`name = $${paramIndex}`)
      values.push(data.name)
      paramIndex++
    }

    if (data.phone !== undefined) {
      setFields.push(`phone = $${paramIndex}`)
      values.push(data.phone)
      paramIndex++
    }

    if (data.profile_picture !== undefined) {
      setFields.push(`profile_picture = $${paramIndex}`)
      values.push(data.profile_picture)
      paramIndex++
    }

    if (setFields.length === 0) {
      return null // Nothing to update
    }

    // Add the user ID as the last parameter
    values.push(userId)

    const query = `
      UPDATE users
      SET ${setFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, phone, role, profile_picture
    `

    const result = await sql(query, ...values)
    return result.rows[0]
  } catch (error) {
    console.error("Error updating user profile:", error)
    return null
  }
}

// Add this function to update only the profile picture
export async function updateUserProfilePicture(userId: string, profilePicture: string) {
  try {
    if (!userId || !profilePicture) {
      throw new Error("User ID and profile picture are required to update profile picture")
    }

    const users = await sql`
      UPDATE users
      SET profile_picture = ${profilePicture}
      WHERE id = ${userId}
      RETURNING id, name, email, phone, role, profile_picture
    `

    return users[0]
  } catch (error) {
    console.error("Error updating user profile picture:", error)
    return null
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

/**
 * Delete a prediction by ID
 * @param id Prediction ID
 * @returns Success status
 */
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

/**
 * Clear all predictions for a user
 * @param userId User ID
 * @returns Success status
 */
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

/**
 * Create a verification code for a user
 * @param identifier User ID, email, or phone
 * @param code Verification code
 * @returns The created verification code record
 */
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

/**
 * Get a verification code by user ID and code
 * @param userId User ID
 * @param code Verification code
 * @returns The verification code record or null
 */
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

/**
 * Get a verification code by identifier (email or phone)
 * @param identifier User ID, email, or phone
 * @returns The verification code record or null
 */
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

/**
 * Verify a code for a user
 * @param userId User ID
 * @param code Verification code
 * @returns Boolean indicating if the code is valid
 */
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

/**
 * Verify an OTP code for a user
 * @param userId User ID or email
 * @param otp Verification code
 * @returns Object with success status and message
 */
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

/**
 * Deletes a verification code
 * @param identifier User ID, email, or phone
 */
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

/**
 * Updates a user's phone number
 * @param userId User ID
 * @param phone New phone number
 */
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
