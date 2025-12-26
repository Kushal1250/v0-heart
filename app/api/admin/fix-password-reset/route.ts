import { NextResponse } from "next/server"
import { fixPasswordResetTokensTable } from "@/scripts/fix-password-reset-tokens-table"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    }

    // This should be protected with admin authentication in production
    const result = await fixPasswordResetTokensTable()

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
