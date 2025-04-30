import { sql } from "@/lib/db"

export async function fixPasswordResetTokensTable() {
  try {
    console.log("Checking password_reset_tokens table...")

    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      );
    `

    if (!tableExists[0].exists) {
      console.log("password_reset_tokens table does not exist, creating it...")

      await sql`
        CREATE TABLE password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_valid BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
        CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      `

      console.log("password_reset_tokens table created successfully")
      return { success: true, message: "Table created successfully" }
    }

    // Check if the table has the correct structure
    console.log("Checking table structure...")

    // Check if user_id column is UUID type
    const userIdType = await sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'password_reset_tokens' AND column_name = 'user_id';
    `

    if (userIdType.length > 0 && userIdType[0].data_type !== "uuid") {
      console.log("Fixing user_id column type...")

      // Create a temporary table with the correct structure
      await sql`
        CREATE TABLE password_reset_tokens_new (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_valid BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        -- Copy data that can be converted (this might fail for some rows)
        INSERT INTO password_reset_tokens_new (id, user_id, token, expires_at, is_valid, created_at)
        SELECT id, user_id::uuid, token, expires_at, is_valid, created_at
        FROM password_reset_tokens
        WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
        
        -- Drop the old table
        DROP TABLE password_reset_tokens;
        
        -- Rename the new table
        ALTER TABLE password_reset_tokens_new RENAME TO password_reset_tokens;
        
        -- Recreate indexes
        CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
        CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      `

      console.log("Fixed user_id column type")
    }

    console.log("password_reset_tokens table is properly set up")
    return { success: true, message: "Table structure is correct" }
  } catch (error) {
    console.error("Error fixing password_reset_tokens table:", error)
    return {
      success: false,
      message: `Failed to fix password_reset_tokens table: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  fixPasswordResetTokensTable()
    .then((result) => console.log(result))
    .catch((error) => console.error(error))
}
