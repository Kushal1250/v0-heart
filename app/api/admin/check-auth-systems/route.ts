import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check verification system
    const verificationCodesTable = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'verification_codes'
      ) as exists
    `

    // Check password reset system
    const passwordResetTable = await db`
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
