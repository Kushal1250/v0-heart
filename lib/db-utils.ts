import { sql } from "@vercel/postgres"

/**
 * Retrieves a user's profile from the database
 * @param userId The ID of the user to retrieve
 * @returns The user profile data or null if not found
 */
export async function getUserProfile(userId: string) {
  try {
    // Query the database for the user profile
    const result = await sql`
      SELECT 
        id, 
        email, 
        name, 
        role, 
        created_at, 
        updated_at,
        profile_picture,
        phone
      FROM users 
      WHERE id = ${userId}
    `

    // If no user is found, return null
    if (result.rows.length === 0) {
      return null
    }

    // Return the user profile data
    return result.rows[0]
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw new Error("Failed to fetch user profile")
  }
}

/**
 * Updates a user's profile in the database
 * @param userId The ID of the user to update
 * @param profileData The profile data to update
 * @returns The updated user profile
 */
export async function updateUserProfile(userId: string, profileData: any) {
  try {
    // Extract the fields to update
    const { name, email, phone, profile_picture } = profileData

    // Update the user profile in the database
    const result = await sql`
      UPDATE users
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        profile_picture = COALESCE(${profile_picture}, profile_picture),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, name, role, created_at, updated_at, profile_picture, phone
    `

    // If no user is found, return null
    if (result.rows.length === 0) {
      return null
    }

    // Return the updated user profile
    return result.rows[0]
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw new Error("Failed to update user profile")
  }
}
