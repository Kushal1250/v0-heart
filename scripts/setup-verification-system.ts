import { db } from "@/lib/db"

/**
 * This script creates the verification_codes table if it doesn't exist
 */
export async function setupVerificationSystem() {
  try {
    console.log("Setting up verification system...")

    // Check if table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      ) as exists
    `

    if (tableExists[0]?.exists) {
      console.log("Verification codes table already exists")
      return { success: true, message: "Verification codes table already exists" }
    }

    // Create verification_codes table
    await db`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        code VARCHAR(10) NOT NULL,
        type VARCHAR(20) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create index for faster lookups
    await db`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id)
    `

    console.log("Verification system setup complete")
    return { success: true, message: "Verification system setup complete" }
  } catch (error) {
    console.error("Error setting up verification system:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
