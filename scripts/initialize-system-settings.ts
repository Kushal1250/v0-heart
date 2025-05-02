import { db } from "@/lib/db"

/**
 * This script initializes the system_settings table and sets all services to active
 */
export async function initializeSystemSettings() {
  try {
    console.log("Initializing system settings...")

    // Check if system_settings table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_settings'
      ) as exists
    `

    // Create system_settings table if it doesn't exist
    if (!tableExists[0]?.exists) {
      console.log("Creating system_settings table...")
      await db`
        CREATE TABLE system_settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) NOT NULL UNIQUE,
          value VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    }

    // Insert or update database status
    await db`
      INSERT INTO system_settings (key, value)
      VALUES ('database_status', 'connected')
      ON CONFLICT (key) DO UPDATE
      SET value = 'connected', updated_at = CURRENT_TIMESTAMP
    `

    // Insert or update verification system status
    await db`
      INSERT INTO system_settings (key, value)
      VALUES ('verification_system', 'active')
      ON CONFLICT (key) DO UPDATE
      SET value = 'active', updated_at = CURRENT_TIMESTAMP
    `

    // Insert or update email service status
    await db`
      INSERT INTO system_settings (key, value)
      VALUES ('email_service', 'configured')
      ON CONFLICT (key) DO UPDATE
      SET value = 'configured', updated_at = CURRENT_TIMESTAMP
    `

    // Insert or update SMS service status
    await db`
      INSERT INTO system_settings (key, value)
      VALUES ('sms_service', 'configured')
      ON CONFLICT (key) DO UPDATE
      SET value = 'configured', updated_at = CURRENT_TIMESTAMP
    `

    // Insert or update last migration
    await db`
      INSERT INTO system_settings (key, value)
      VALUES ('last_migration', 'system_settings')
      ON CONFLICT (key) DO UPDATE
      SET value = 'system_settings', updated_at = CURRENT_TIMESTAMP
    `

    return {
      success: true,
      message: "System settings initialized successfully",
    }
  } catch (error) {
    console.error("Error initializing system settings:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
