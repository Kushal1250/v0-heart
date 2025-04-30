import { sql } from "@/lib/db"

export async function repairPasswordResetSystem() {
  try {
    console.log("Starting password reset system repair...")

    // Step 1: Check if the password_reset_tokens table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      );
    `

    const tableExists = tableCheck[0]?.exists || false

    if (!tableExists) {
      console.log("Creating password_reset_tokens table...")

      // Create the table with the correct structure
      await sql`
        CREATE TABLE password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_valid BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
        CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      `

      console.log("password_reset_tokens table created successfully")
    } else {
      console.log("password_reset_tokens table exists, checking structure...")

      // Check the user_id column type
      const columnCheck = await sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'password_reset_tokens' AND column_name = 'user_id';
      `

      const userIdType = columnCheck[0]?.data_type
      console.log(`Current user_id column type: ${userIdType}`)

      if (userIdType !== "uuid") {
        console.log("Fixing user_id column type...")

        // Drop foreign key constraint if it exists
        try {
          await sql`
            ALTER TABLE password_reset_tokens 
            DROP CONSTRAINT IF EXISTS fk_user;
          `
        } catch (e) {
          console.log("No foreign key constraint to drop")
        }

        // Drop the table and recreate it
        await sql`DROP TABLE password_reset_tokens;`

        await sql`
          CREATE TABLE password_reset_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            token TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            is_valid BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
          CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
        `

        console.log("Recreated password_reset_tokens table with correct structure")
      }
    }

    // Step 2: Check if the foreign key constraint exists and remove it if it does
    // This is to prevent foreign key constraint violations
    try {
      await sql`
        ALTER TABLE password_reset_tokens 
        DROP CONSTRAINT IF EXISTS fk_user;
      `
      console.log("Removed foreign key constraint if it existed")
    } catch (e) {
      console.log("No foreign key constraint to drop or already dropped")
    }

    console.log("Password reset system repair completed successfully")
    return { success: true, message: "Password reset system repaired successfully" }
  } catch (error) {
    console.error("Error repairing password reset system:", error)
    return {
      success: false,
      message: `Failed to repair password reset system: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
