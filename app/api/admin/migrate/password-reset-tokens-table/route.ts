import { type NextRequest, NextResponse } from "next/server"
import createPasswordResetTokensTable from "../../../../../scripts/create-password-reset-tokens-table"
import { getUserFromRequest } from "../../../../../lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await createPasswordResetTokensTable()

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 })
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in migration route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
