import { NextResponse } from "next/server"
import { repairPasswordResetSystem } from "@/scripts/repair-password-reset-system"

export async function POST(request: Request) {
  try {
    const result = await repairPasswordResetSystem()

    if (result.success) {
      return NextResponse.json({ message: result.message })
    } else {
      return NextResponse.json({ message: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in repair-password-reset API route:", error)
    return NextResponse.json(
      {
        message: `Failed to repair password reset system: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
