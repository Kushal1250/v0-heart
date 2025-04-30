import { NextResponse } from "next/server"
import { fixResetTokensTable } from "@/scripts/fix-reset-tokens-table"

export async function POST(request: Request) {
  try {
    // This should be protected with admin authentication in production
    const result = await fixResetTokensTable()

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ message: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fixing password reset tokens table:", error)
    return NextResponse.json({ message: "Failed to fix password reset tokens table" }, { status: 500 })
  }
}
