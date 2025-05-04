import { getDbConnection } from "./db-connection"
import { sql } from "drizzle-orm"

export interface UserProfile {
  id: string
  name: string | null
  email: string
  phone?: string
  profile_picture?: string
  role?: string
  created_at?: string
  health_metrics?: {
    height?: string
    weight?: string
    bloodType?: string
    allergies?: string
    medicalConditions?: string
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const db = await getDbConnection()

    // Get user data
    let userData
    if (db.sql) {
      userData = await db.sql`
        SELECT id, name, email, phone, role, created_at, profile_picture
        FROM users
        WHERE id = ${userId}
      `
    } else {
      userData = await db.execute(sql`
        SELECT id, name, email, phone, role, created_at, profile_picture
        FROM users
        WHERE id = ${userId}
      `)
    }

    if (!userData || userData.length === 0) {
      return null
    }

    const user = userData[0]

    // Get health metrics if available
    let healthData
    try {
      if (db.sql) {
        healthData = await db.sql`
          SELECT height, weight, blood_type, allergies, medical_conditions
          FROM health_metrics
          WHERE user_id = ${userId}
        `
      } else {
        healthData = await db.execute(sql`
          SELECT height, weight, blood_type, allergies, medical_conditions
          FROM health_metrics
          WHERE user_id = ${userId}
        `)
      }
    } catch (error) {
      console.warn("Health metrics table may not exist:", error)
      healthData = []
    }

    // Combine user data with health metrics
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      profile_picture: user.profile_picture,
      health_metrics:
        healthData && healthData.length > 0
          ? {
              height: healthData[0].height,
              weight: healthData[0].weight,
              bloodType: healthData[0].blood_type,
              allergies: healthData[0].allergies,
              medicalConditions: healthData[0].medical_conditions,
            }
          : undefined,
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const db = await getDbConnection()

    // Start building the update query
    const updateFields: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updateFields.push("name = ?")
      values.push(data.name)
    }

    if (data.phone !== undefined) {
      updateFields.push("phone = ?")
      values.push(data.phone)
    }

    if (data.profile_picture !== undefined) {
      updateFields.push("profile_picture = ?")
      values.push(data.profile_picture)
    }

    if (updateFields.length === 0) {
      return await getUserProfile(userId)
    }

    // Execute the update query
    if (db.sql) {
      await db.sql`
        UPDATE users
        SET ${updateFields.join(", ")}
        WHERE id = ${userId}
      `
    } else {
      await db.execute(sql`
        UPDATE users
        SET ${updateFields.join(", ")}
        WHERE id = ${userId}
      `)
    }

    // Update health metrics if provided
    if (data.health_metrics) {
      try {
        // Check if health metrics exist for this user
        let existingMetrics
        if (db.sql) {
          existingMetrics = await db.sql`
            SELECT id FROM health_metrics WHERE user_id = ${userId}
          `
        } else {
          existingMetrics = await db.execute(sql`
            SELECT id FROM health_metrics WHERE user_id = ${userId}
          `)
        }

        const healthFields: string[] = []
        const healthValues: any[] = []

        if (data.health_metrics.height !== undefined) {
          healthFields.push("height = ?")
          healthValues.push(data.health_metrics.height)
        }

        if (data.health_metrics.weight !== undefined) {
          healthFields.push("weight = ?")
          healthValues.push(data.health_metrics.weight)
        }

        if (data.health_metrics.bloodType !== undefined) {
          healthFields.push("blood_type = ?")
          healthValues.push(data.health_metrics.bloodType)
        }

        if (data.health_metrics.allergies !== undefined) {
          healthFields.push("allergies = ?")
          healthValues.push(data.health_metrics.allergies)
        }

        if (data.health_metrics.medicalConditions !== undefined) {
          healthFields.push("medical_conditions = ?")
          healthValues.push(data.health_metrics.medicalConditions)
        }

        if (healthFields.length > 0) {
          if (existingMetrics && existingMetrics.length > 0) {
            // Update existing health metrics
            if (db.sql) {
              await db.sql`
                UPDATE health_metrics
                SET ${healthFields.join(", ")}
                WHERE user_id = ${userId}
              `
            } else {
              await db.execute(sql`
                UPDATE health_metrics
                SET ${healthFields.join(", ")}
                WHERE user_id = ${userId}
              `)
            }
          } else {
            // Insert new health metrics
            if (db.sql) {
              await db.sql`
                INSERT INTO health_metrics (user_id, height, weight, blood_type, allergies, medical_conditions)
                VALUES (${userId}, ${data.health_metrics.height || null}, ${data.health_metrics.weight || null}, 
                        ${data.health_metrics.bloodType || null}, ${data.health_metrics.allergies || null}, 
                        ${data.health_metrics.medicalConditions || null})
              `
            } else {
              await db.execute(sql`
                INSERT INTO health_metrics (user_id, height, weight, blood_type, allergies, medical_conditions)
                VALUES (${userId}, ${data.health_metrics.height || null}, ${data.health_metrics.weight || null}, 
                        ${data.health_metrics.bloodType || null}, ${data.health_metrics.allergies || null}, 
                        ${data.health_metrics.medicalConditions || null})
              `)
            }
          }
        }
      } catch (error) {
        console.error("Error updating health metrics:", error)
        // Continue even if health metrics update fails
      }
    }

    // Return the updated profile
    return await getUserProfile(userId)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return null
  }
}
