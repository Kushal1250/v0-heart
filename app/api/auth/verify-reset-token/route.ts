import { NextResponse } from "next/server"
import { verifySimpleResetToken } from "@/lib/simple-token"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, message: "Token is required" }, { status: 400 })
    }

    const userId = await verifySimpleResetToken(token)

    if (!userId) {
      return NextResponse.json({ valid: false, message: "Invalid or expired token" })
    }

    return NextResponse.json({ valid: true, userId })
  } catch (error) {
    console.error("Error verifying reset token:", error)
    return NextResponse.json({ valid: false, message: "An error occurred while verifying the token" }, { status: 500 })
  }
}
