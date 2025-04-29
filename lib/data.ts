import { db } from "./db"

/**
 * Get a user by their email address
 * @param email The email address to look up
 * @returns The user object or null if not found
 */
export async function getUserByEmail(email: string) {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

/**
 * Get a user by their phone number
 * @param phone The phone number to look up
 * @returns The user object or null if not found
 */
export async function getUserByPhone(phone: string) {
  try {
    const result = await db.query("SELECT * FROM users WHERE phone_number = $1 LIMIT 1", [phone])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching user by phone:", error)
    return null
  }
}

/**
 * Get a user by their ID
 * @param id The user ID to look up
 * @returns The user object or null if not found
 */
export async function getUserById(id: string) {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [id])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }
}
