import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth-utils"
import fixVerificationCodesTable from "@/scripts/fix-verification-codes-table"

export async function POST(request: Request) {
  try {
    // Verify admin session
    const admin = await verifyAdminSession(request)
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Run the migration
    const result = await fixVerificationCodesTable()

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 500 })
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error("Error running verification codes table fix:", error)
    return NextResponse.json(
      { message: `Error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
