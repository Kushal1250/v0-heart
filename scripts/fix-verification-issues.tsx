"use server"

import { db } from "@/lib/db"
import { logError } from "@/lib/error-logger"

type FixResult = {
  success: boolean
  message: string
  details?: any
}

export async function fixVerificationCodesTable(): Promise<FixResult> {
  try {
    console.log("Starting verification_codes table fix...")

    // Check if table exists
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      );
    `

    if (!tableExists[0]?.exists) {
      console.log("verification_codes table doesn't exist, creating it...")

      // Create the table with correct structure
      await db`
        CREATE TABLE verification_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL,
          code TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
        )
      `

      return {
        success: true,
        message: "verification_codes table created successfully",
      }
    }

    // Check column types
    const columns = await db`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'verification_codes'
    `

    const userIdColumn = columns.find((col) => col.column_name === "user_id")

    if (!userIdColumn) {
      return {
        success: false,
        message: "user_id column not found in verification_codes table",
      }
    }

    // If user_id is UUID, we need to change it to TEXT
    if (userIdColumn.data_type.toLowerCase() === "uuid") {
      console.log("user_id column is UUID, changing to TEXT...")

      // Create a backup of the table
      await db`CREATE TABLE verification_codes_backup AS SELECT * FROM verification_codes`

      // Drop constraints
      const constraints = await db`
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'verification_codes'::regclass
      `

      for (const constraint of constraints) {
        await db`ALTER TABLE verification_codes DROP CONSTRAINT IF EXISTS ${constraint.conname}`
      }

      // Alter the column type
      await db`ALTER TABLE verification_codes ALTER COLUMN user_id TYPE TEXT`

      return {
        success: true,
        message: "user_id column type changed from UUID to TEXT",
        details: {
          backupCreated: true,
          previousType: "UUID",
          newType: "TEXT",
        },
      }
    }

    return {
      success: true,
      message: "verification_codes table structure is already correct",
      details: {
        userIdType: userIdColumn.data_type,
      },
    }
  } catch (error) {
    console.error("Error fixing verification_codes table:", error)
    await logError("fixVerificationCodesTable", error)

    return {
      success: false,
      message: `Failed to fix verification_codes table: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error: String(error) },
    }
  }
}

export async function runDatabaseChecks(): Promise<FixResult[]> {
  const results: FixResult[] = []

  try {
    // Check database connection
    try {
      await db`SELECT 1 as connected`
      results.push({
        success: true,
        message: "Database connection successful",
      })
    } catch (error) {
      results.push({
        success: false,
        message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
      // If we can't connect to the database, return early
      return results
    }

    // Check verification_codes table
    const verificationResult = await fixVerificationCodesTable()
    results.push(verificationResult)

    // Check other tables as needed...

    return results
  } catch (error) {
    console.error("Error running database checks:", error)
    await logError("runDatabaseChecks", error)

    results.push({
      success: false,
      message: `Failed to run database checks: ${error instanceof Error ? error.message : "Unknown error"}`,
    })

    return results
  }
}
