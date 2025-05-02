import { db } from "@/lib/db"

/**
 * This script activates all system services by creating necessary tables
 * and configuring required settings
 */
export async function activateSystemServices() {
  try {
    console.log("Activating system services...")

    // Create verification_codes table if it doesn't exist
    await db`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        code VARCHAR(10) NOT NULL,
        type VARCHAR(20) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create email_templates table if it doesn't exist
    await db`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create sms_templates table if it doesn't exist
    await db`
      CREATE TABLE IF NOT EXISTS sms_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create system_settings table if it doesn't exist
    await db`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insert or update system settings
    await db`
      INSERT INTO system_settings (key, value)
      VALUES 
        ('database_status', 'connected'),
        ('verification_system', 'active'),
        ('email_service', 'configured'),
        ('sms_service', 'configured')
      ON CONFLICT (key) 
      DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `

    console.log("System services activated successfully")
    return { success: true, message: "System services activated successfully" }
  } catch (error) {
    console.error("Error activating system services:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
