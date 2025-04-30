import { NextResponse } from "next/server"
import { performDetailedDiagnostics, fixResetTokensTableWithDetails } from "@/lib/db-detailed-diagnostics"

export async function GET(request: Request) {
  try {
    const diagnostics = await performDetailedDiagnostics()
    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error("Error performing detailed diagnostics:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error performing detailed diagnostics",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const result = await fixResetTokensTableWithDetails()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fixing reset tokens table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error fixing reset tokens table",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
