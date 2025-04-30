import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    console.log("Attempting to fix password reset token system...")

    // Check if the table exists
    const tableExists = await checkTableExists("password_reset_tokens")

    if (!tableExists) {
      console.log("Creating password_reset_tokens table...")

      // Create the table
      await sql`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_valid BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Create indexes
      await sql`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)
      `

      await sql`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)
      `

      console.log("Table created successfully")
    } else {
      console.log("Table already exists, checking structure...")

      // Check if required columns exist
      const hasRequiredColumns = await checkColumnsExist("password_reset_tokens", [
        "id",
        "user_id",
        "token",
        "expires_at",
        "is_valid",
        "created_at",
      ])

      if (!hasRequiredColumns) {
        console.log("Fixing table structure...")

        // Add missing columns if needed
        await sql`
          ALTER TABLE password_reset_tokens 
          ADD COLUMN IF NOT EXISTS is_valid BOOLEAN DEFAULT true
        `

        console.log("Table structure fixed")
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password reset token system fixed successfully",
    })
  } catch (error) {
    console.error("Error fixing password reset token system:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fix password reset token system",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

async function checkColumnsExist(tableName: string, columns: string[]): Promise<boolean> {
  try {
    for (const column of columns) {
      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
          AND column_name = ${column}
        )
      `

      if (!result[0]?.exists) {
        console.log(`Column ${column} does not exist in ${tableName}`)
        return false
      }
    }

    return true
  } catch (error) {
    console.error(`Error checking columns in table ${tableName}:`, error)
    return false
  }
}
