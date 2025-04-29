import { db } from "../lib/db"

async function createPasswordResetTokensTable() {
  try {
    console.log("Creating password_reset_tokens table if it does not exist...")

    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
    `)

    console.log("Password reset tokens table created or already exists.")
    return { success: true, message: "Password reset tokens table created or already exists." }
  } catch (error) {
    console.error("Error creating password_reset_tokens table:", error)
    return { success: false, message: `Error creating table: ${error.message}` }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  createPasswordResetTokensTable()
    .then((result) => {
      console.log(result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error("Unhandled error:", error)
      process.exit(1)
    })
}

export default createPasswordResetTokensTable
