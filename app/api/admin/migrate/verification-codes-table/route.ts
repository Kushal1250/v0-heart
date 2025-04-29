import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Create verification_codes table
    await sql`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
      )
    `

    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id)
    `

    return NextResponse.json({ message: "Verification codes table created successfully" })
  } catch (error) {
    console.error("Error creating verification codes table:", error)
    return NextResponse.json(
      {
        message: `Failed to create verification codes table: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
