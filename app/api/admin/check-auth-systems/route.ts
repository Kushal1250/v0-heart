import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Check verification system
    const verificationCodesTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      ) as exists
    `

    // Check password reset system
    const passwordResetTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      ) as exists
    `

    return NextResponse.json({
      success: true,
      verification: {
        status: verificationCodesTable[0]?.exists ? "active" : "not_configured",
        tableExists: verificationCodesTable[0]?.exists || false,
      },
      passwordReset: {
        status: passwordResetTable[0]?.exists ? "active" : "not_configured",
        tableExists: passwordResetTable[0]?.exists || false,
      },
    })
  } catch (error) {
    console.error("Error checking auth systems:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
