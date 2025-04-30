import { NextResponse } from "next/server"
import { testDatabaseConnection, checkResetTokensTable } from "@/lib/db-diagnostics"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Run diagnostics
    const connectionTest = await testDatabaseConnection()
    const tableCheck = await checkResetTokensTable()

    return NextResponse.json({
      connectionTest,
      tableCheck,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in reset token system diagnostics:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error running diagnostics",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Create the table with a simplified structure
    await db.query(`
      DROP TABLE IF EXISTS password_reset_tokens;
      
      CREATE TABLE password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
    `)

    return NextResponse.json({
      success: true,
      message: "Reset tokens table recreated successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error recreating reset tokens table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error recreating reset tokens table",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
