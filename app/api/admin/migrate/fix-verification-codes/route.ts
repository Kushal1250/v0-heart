import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyAdminSession } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    console.log("Starting verification_codes table migration...")

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
      return NextResponse.json({
        success: true,
        message: "verification_codes table created successfully",
      })
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

      // Drop the original table
      await sql`DROP TABLE verification_codes`

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

      // Try to restore data if possible
      try {
        await sql`
          INSERT INTO verification_codes (id, user_id, code, created_at, expires_at)
          SELECT id, user_id::text, code, created_at, expires_at
          FROM verification_codes_backup
        `
      } catch (restoreError) {
        console.log("Could not restore old data, but that's expected and fine")
      }

      return NextResponse.json({
        success: true,
        message: "verification_codes table structure updated successfully",
      })
    }

    return NextResponse.json({
      success: true,
      message: "verification_codes table structure is already correct",
    })
  } catch (error) {
    console.error("Error in fix-verification-codes migration:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
