import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const isAdmin = (await cookies()).get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Migration API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    const migrations = []

    // Check if last_login column exists in users table
    const checkLastLoginColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'last_login'
    `

    // If column doesn't exist, add it
    if (checkLastLoginColumn.length === 0) {
      await sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE
      `
      migrations.push("Added last_login column to users table")
    }

    // Check if predictions table exists
    const checkPredictionsTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'predictions'
    `

    // If predictions table doesn't exist, create it
    if (checkPredictionsTable.length === 0) {
      await sql`
        CREATE TABLE predictions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          result NUMERIC NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          prediction_data JSONB,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `
      migrations.push("Created predictions table")
    }

    if (migrations.length === 0) {
      return NextResponse.json({ message: "No migrations needed: database schema is up to date" })
    }

    return NextResponse.json({
      message: "Migration successful",
      migrations: migrations,
    })
  } catch (error) {
    console.error("Error during migration:", error)
    return NextResponse.json({ message: "Migration failed", error: String(error) }, { status: 500 })
  }
}
