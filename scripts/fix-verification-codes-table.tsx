"use server"

import { sql } from "@/lib/db"

export default async function fixVerificationCodesTable() {
  try {
    console.log("Checking verification_codes table...")

    // Check if the table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'verification_codes'
      );
    `

    if (!tableExists[0].exists) {
      console.log("verification_codes table does not exist, creating it...")

      // Create the table
      await sql`
        CREATE TABLE verification_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `

      console.log("verification_codes table created successfully")
      return { success: true, message: "verification_codes table created successfully" }
    }

    // Check if the user_id column is UUID or TEXT
    const columnType = await sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'verification_codes' 
      AND column_name = 'user_id'
    `

    if (columnType.length > 0 && columnType[0].data_type === "uuid") {
      console.log("Converting user_id column from UUID to TEXT...")

      // Create a temporary table with the correct structure
      await sql`
        CREATE TABLE verification_codes_new (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `

      // Copy data from the old table to the new one, converting UUIDs to text
      await sql`
        INSERT INTO verification_codes_new (id, user_id, code, created_at, expires_at)
        SELECT id, user_id::TEXT, code, created_at, expires_at
        FROM verification_codes
      `

      // Drop the old table
      await sql`DROP TABLE verification_codes`

      // Rename the new table to the original name
      await sql`ALTER TABLE verification_codes_new RENAME TO verification_codes`

      console.log("user_id column converted from UUID to TEXT successfully")
    } else {
      console.log("verification_codes table structure is already correct")
    }

    return { success: true, message: "verification_codes table structure verified and fixed if needed" }
  } catch (error) {
    console.error("Error fixing verification_codes table:", error)
    return {
      success: false,
      message: `Error fixing verification_codes table: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
