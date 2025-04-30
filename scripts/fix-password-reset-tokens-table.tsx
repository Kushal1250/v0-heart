import { db } from "@/lib/db"

/**
 * This script ensures the password_reset_tokens table exists and has the correct structure
 */
export async function fixPasswordResetTokensTable() {
  try {
    console.log("Checking password_reset_tokens table...")

    // Check if the table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      )
    `)

    if (!tableExists.rows[0].exists) {
      console.log("Creating password_reset_tokens table...")

      // Create the table
      await db.query(`
        CREATE TABLE password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_valid BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)

      // Create indexes
      await db.query(`CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)`)
      await db.query(`CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)`)

      console.log("Table created successfully")
      return { success: true, message: "Password reset tokens table created" }
    }

    // Check if the table has the correct structure
    console.log("Checking table structure...")

    // Check if is_valid column exists
    const isValidExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'password_reset_tokens' AND column_name = 'is_valid'
      )
    `)

    if (!isValidExists.rows[0].exists) {
      console.log("Adding is_valid column...")
      await db.query(`ALTER TABLE password_reset_tokens ADD COLUMN is_valid BOOLEAN DEFAULT true`)
    }

    // Check if indexes exist
    const tokenIndexExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE indexname = 'idx_password_reset_tokens_token'
      )
    `)

    if (!tokenIndexExists.rows[0].exists) {
      console.log("Creating token index...")
      await db.query(`CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)`)
    }

    const userIdIndexExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE indexname = 'idx_password_reset_tokens_user_id'
      )
    `)

    if (!userIdIndexExists.rows[0].exists) {
      console.log("Creating user_id index...")
      await db.query(`CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)`)
    }

    console.log("Password reset tokens table is properly configured")
    return { success: true, message: "Password reset tokens table verified" }
  } catch (error) {
    console.error("Error fixing password reset tokens table:", error)
    return { success: false, error: "Failed to fix password reset tokens table" }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  fixPasswordResetTokensTable()
    .then((result) => {
      console.log(result)
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
