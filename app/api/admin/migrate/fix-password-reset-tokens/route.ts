import { NextResponse } from "next/server"
import { fixPasswordResetTokensTable } from "@/scripts/fix-password-reset-tokens-table"

export async function POST(request: Request) {
  try {
    const result = await fixPasswordResetTokensTable()

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ message: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in fix-password-reset-tokens API route:", error)
    return NextResponse.json(
      {
        message: `Failed to fix password reset tokens table: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
