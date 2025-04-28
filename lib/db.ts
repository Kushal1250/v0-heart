import { neon } from "@neondatabase/serverless"
import { hash, compare } from "bcrypt-ts"
import { v4 as uuidv4 } from "uuid"

// Create a SQL query executor using the Neon serverless driver
export const sql = neon(process.env.DATABASE_URL!)

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
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
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

export async function getUserByPhone(phone: string) {
  try {
    const users = await sql`SELECT * FROM users WHERE phone = ${phone}`
    return users[0] || null
  } catch (error) {
    console.error("Error getting user by phone:", error)
    return null
  }
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
    return compare(password, hashedPassword)
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
export async function createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
  try {
    if (!userId || !token || !expiresAt) {
      throw new Error("User ID, token, and expiration date are required to create a password reset token")
    }

    const resetId = uuidv4()

    await sql`
      INSERT INTO password_resets (id, user_id, token, expires_at)
      VALUES (${resetId}, ${userId}, ${token}, ${expiresAt})
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
      SELECT * FROM password_resets
      WHERE token = ${token} AND expires_at > NOW()
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

    const hashedPassword = await hash(newPassword, 10)
    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`
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

export async function createPrediction(
  userId: string,
  result: number,
  predictionData: Record<string, any>,
): Promise<any> {
  try {
    if (!userId) {
      throw new Error("User ID is required to create a prediction")
    }

    const predictionId = uuidv4()

    const predictions = await sql`
      INSERT INTO predictions (id, user_id, result, prediction_data)
      VALUES (${predictionId}, ${userId}, ${result}, ${JSON.stringify(predictionData)})
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

    const predictions = await sql`
      SELECT * FROM predictions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
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
