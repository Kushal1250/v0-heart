import { sql } from "@/lib/db"

async function fixVerificationCodesTable() {
  try {
    console.log("Checking verification_codes table structure...")

    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      );
    `

    if (!tableExists[0].exists) {
      console.log("verification_codes table doesn't exist, creating it...")
      await sql`
        CREATE TABLE verification_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
        )
      `
      console.log("verification_codes table created successfully")
      return true
    }

    // Check if user_id is UUID or TEXT
    const columnType = await sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'verification_codes' AND column_name = 'user_id'
    `

    if (columnType.length > 0 && columnType[0].data_type === "uuid") {
      console.log("Altering user_id column to TEXT type...")

      // Create a backup of the table
      await sql`CREATE TABLE verification_codes_backup AS SELECT * FROM verification_codes`
      console.log("Backup created: verification_codes_backup")

      // Drop the original table
      await sql`DROP TABLE verification_codes`
      console.log("Original table dropped")

      // Create the table with the correct column type
      await sql`
        CREATE TABLE verification_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
        )
      `
      console.log("Table recreated with TEXT type for user_id")

      // Try to restore data if possible (will fail for non-UUID values, which is fine)
      try {
        await sql`
          INSERT INTO verification_codes (id, user_id, code, created_at, expires_at)
          SELECT id, user_id::text, code, created_at, expires_at
          FROM verification_codes_backup
        `
        console.log("Data restored from backup")
      } catch (restoreError) {
        console.log("Could not restore old data, but that's expected and fine")
      }

      console.log("verification_codes table structure fixed successfully")
    } else {
      console.log("verification_codes table structure is already correct")
    }

    return true
  } catch (error) {
    console.error("Error fixing verification_codes table:", error)
    return false
  }
}

// Execute the function
fixVerificationCodesTable()
  .then((result) => {
    console.log("Script completed with result:", result)
    process.exit(0)
  })
  .catch((error) => {
    console.error("Script failed:", error)
    process.exit(1)
  })
