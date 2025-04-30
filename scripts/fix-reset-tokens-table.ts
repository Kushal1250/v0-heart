import { db } from "@/lib/db"
import { logError } from "@/lib/error-logger"

/**
 * Ensures the password_reset_tokens table exists and has the correct structure
 */
export async function fixResetTokensTable() {
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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

    // Check if foreign key constraint exists and remove it if it does
    const constraintExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints
        WHERE table_name = 'password_reset_tokens' AND constraint_type = 'FOREIGN KEY'
      )
    `)

    if (constraintExists.rows[0].exists) {
      console.log("Removing foreign key constraint...")
      // Get the constraint name
      const constraintName = await db.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'password_reset_tokens' AND constraint_type = 'FOREIGN KEY'
      `)

      if (constraintName.rows.length > 0) {
        await db.query(`
          ALTER TABLE password_reset_tokens 
          DROP CONSTRAINT ${constraintName.rows[0].constraint_name}
        `)
      }
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
    await logError("fixResetTokensTable", error)
    return { success: false, error: "Failed to fix password reset tokens table" }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  fixResetTokensTable()
    .then((result) => {
      console.log(result)
      process.exit(0)
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
